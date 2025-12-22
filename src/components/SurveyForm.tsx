import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Input,
  Button,
  Radio,
  Checkbox,
  Typography,
  Card,
  Space,
  Alert,
  Spin,
  Divider,
  message,
} from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import type { Campaign, SurveyError, Question, BasicSubmissionPayload } from '../types/survey';
import { fetchCampaign, submitBasicSurveyInfo, submitSurveyAnswers } from '../utils/api';
import { captureMetadata, isValidEmail, isValidPhone } from '../utils/helpers';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface SurveyFormProps {
  campaignId: string;
}

const SurveyForm: React.FC<SurveyFormProps> = ({ campaignId }) => {
  const [form] = Form.useForm();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<SurveyError | null>(null);
  const [optOutOfContest, setOptOutOfContest] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadCampaign = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCampaign(campaignId);
      
      if (!data.active) {
        setError('CAMPAIGN_INACTIVE');
      } else {
        setCampaign(data);
      }
    } catch (err) {
      // Handle specific error codes from backend
      const error = err as { response?: { status?: number; data?: { code?: string } } };
      if (error.response?.status === 429) {
        setError('TOO_MANY_ATTEMPTS');
      } else if (error.response?.data?.code === 'ALREADY_SUBMITTED') {
        setError('ALREADY_ENTERED_TODAY');
      } else {
        setError('INVALID_PARAMETERS');
      }
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  const handleSubmit = async (values: Record<string, string | number>) => {
    if (!campaign || !campaign.questions) return;

    try {
      setSubmitting(true);

      // Capture metadata
      const metadata = captureMetadata();

      // Phase 1: Submit basic survey info and user details
      const basicPayload: BasicSubmissionPayload = {
        rewardOptIn: campaign.reward ? !optOutOfContest : false,
        metadataJson: [metadata as unknown as Record<string, unknown>],
        workplace: campaign.workplace?.['@id'] || '',
        uniqueUrlToken: campaignId,
      };

      // Add customer info if provided
      if (campaign.reward && !optOutOfContest) {
        basicPayload.name = values.name as string;
        basicPayload.email = values.email as string;
        basicPayload.phone = values.phone as string;
      }

      const basicResponse = await submitBasicSurveyInfo(basicPayload);
      const submissionId = basicResponse.id;

      // Phase 2: Submit survey answers
      const answers = (campaign.questions as Question[]).map((question) => ({
        questionId: typeof question.id === 'number' ? question.id : parseInt(question.id as string),
        value: values[`question_${question.id}`],
      }));

      await submitSurveyAnswers({
        uniqueUrlToken: campaignId,
        feedbackSubmissionId: submissionId,
        answers,
      });

      setSubmitted(true);
      message.success('Survey submitted successfully!');
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { code?: string } } };
      if (error.response?.status === 429) {
        setError('TOO_MANY_ATTEMPTS');
      } else if (error.response?.data?.code === 'ALREADY_SUBMITTED') {
        setError('ALREADY_ENTERED_TODAY');
      } else {
        message.error('Failed to submit survey. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'rating': {
        const ratingLabels = ['Poor', 'Fair', 'Average', 'Good', 'Excellent'];
        const ratingEmojis = ['😠', '😞', '😐', '😊', '😄'];
        return (
          <Form.Item
            key={question.id}
            name={`question_${question.id}`}
            label={question.question}
            rules={[{ required: question.required, message: 'Please provide a rating' }]}
          >
            <div>
              <Radio.Group>
                <Space direction="horizontal" size={isMobile ? 'small' : 'large'} style={{ width: '100%', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} style={{ textAlign: 'center' }}>
                      <Radio value={value} style={{ display: 'block', marginBottom: isMobile ? 4 : 8 }}>
                        {isMobile ? (
                          <span style={{ fontSize: 24 }}>{ratingEmojis[value - 1]}</span>
                        ) : (
                          <span style={{ fontSize: 16, fontWeight: 500 }}>{value}</span>
                        )}
                      </Radio>
                      {!isMobile && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {ratingLabels[value - 1]}
                        </Text>
                      )}
                    </div>
                  ))}
                </Space>
              </Radio.Group>
            </div>
          </Form.Item>
        );
      }

      case 'yesNo':
        return (
          <Form.Item
            key={question.id}
            name={`question_${question.id}`}
            label={question.question}
            rules={[{ required: question.required, message: 'Please select an option' }]}
          >
            <Radio.Group>
              <Space direction="horizontal" size={isMobile ? 'large' : 'middle'}>
                <Radio value="yes">
                  {isMobile ? <span style={{ fontSize: 24 }}>👍</span> : 'Yes'}
                </Radio>
                <Radio value="no">
                  {isMobile ? <span style={{ fontSize: 24 }}>👎</span> : 'No'}
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        );

      case 'multipleChoice':
        return (
          <Form.Item
            key={question.id}
            name={`question_${question.id}`}
            label={question.question}
            rules={[{ required: question.required, message: 'Please select an option' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                {question.options?.map((option: string) => (
                  <Radio key={option} value={option}>
                    {option}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>
        );

      case 'text':
      default:
        return (
          <Form.Item
            key={question.id}
            name={`question_${question.id}`}
            label={question.question}
            rules={[{ required: question.required, message: 'Please provide an answer' }]}
          >
            <TextArea rows={isMobile ? 2 : 3} placeholder="Enter your response" />
          </Form.Item>
        );
    }
  };

  const renderErrorMessage = () => {
    const errorMessages = {
      CAMPAIGN_INACTIVE: 'This Feedback Survey is Not Active',
      ALREADY_ENTERED_TODAY: 'You have already entered this contest today',
      TOO_MANY_ATTEMPTS: 'You have made too many attempts to submit this Survey',
      INVALID_PARAMETERS: 'Invalid survey parameters. Please check your link.',
      SUBMISSION_ERROR: 'An error occurred while submitting your survey. Please try again.',
    };

    return (
      <div style={{ 
        maxWidth: 600, 
        margin: '100px auto', 
        padding: '0 24px',
        textAlign: 'center' 
      }}>
        <Alert
          message={error ? errorMessages[error] : 'An error occurred'}
          type="warning"
          showIcon
          style={{ fontSize: 16 }}
        />
      </div>
    );
  };

  const renderSuccessMessage = () => {
    return (
      <div style={{ 
        maxWidth: 600, 
        margin: '100px auto', 
        padding: '0 24px',
        textAlign: 'center' 
      }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
            <Title level={3}>Thank you for your feedback!</Title>
            {campaign?.reward && !optOutOfContest && campaign.rewardDetailsText && (
              <Paragraph>{campaign.rewardDetailsText}</Paragraph>
            )}
          </Space>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return renderErrorMessage();
  }

  if (submitted) {
    return renderSuccessMessage();
  }

  if (!campaign) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', padding: isMobile ? '16px 0' : '24px 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>
        {/* Header with logo */}
        {campaign.guestConnectSetting?.logoPath && (
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 20 : 32 }}>
            <img 
              src={`${import.meta.env.VITE_IMAGE_URL}${campaign.guestConnectSetting.logoPath}`}
              alt="Company Logo" 
              style={{ maxWidth: 200, maxHeight: 80 }}
            />
          </div>
        )}

        <Card style={{ padding: isMobile ? '16px' : undefined }}>
          <Title level={isMobile ? 3 : 2} style={{ textAlign: 'center', marginBottom: 8 }}>
            {campaign.title}
          </Title>

          {/* Subheader based on reward status */}
          <Paragraph style={{ textAlign: 'center', marginBottom: isMobile ? 20 : 32, color: '#666', fontSize: isMobile ? 14 : 16 }}>
            {campaign.reward ? 'Complete this Survey and You can Enter our Contest Below!' : 'Your Feedback Will Help Us Improve!'}
          </Paragraph>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            {/* Survey Questions */}
            <Divider style={{ margin: isMobile ? '16px 0' : '24px 0' }}>Survey Questions</Divider>
            {campaign.questions && Array.isArray(campaign.questions) ? (
              campaign.questions.map((q) => (
                <div key={q.id} style={{ marginBottom: isMobile ? 16 : 24 }}>
                  {renderQuestion(q)}
                </div>
              ))
            ) : (
              <Alert 
                message="Unable to load survey questions" 
                type="error" 
                style={{ marginBottom: 24 }} 
              />
            )}

            {/* Reward Details Section - After Survey Questions */}
            {campaign.reward && (
              <>
                <Divider style={{ margin: isMobile ? '16px 0' : '24px 0' }}>Contest</Divider>
                {campaign.reward.title && (
                  <Paragraph style={{ fontSize: isMobile ? 14 : 16, fontWeight: 500, marginBottom: isMobile ? 8 : 12 }}>
                    {campaign.reward.title}
                  </Paragraph>
                )}
                {/* {campaign.reward.description && (
                  <Paragraph style={{ marginBottom: 24 }}>
                    {campaign.reward.description}
                  </Paragraph>
                )} */}
                {campaign.rewardDetailsText && (
                  <Alert
                    message={campaign.rewardDetailsText}
                    type="info"
                    showIcon
                    style={{ marginBottom: isMobile ? 16 : 24 }}
                  />
                )}
              </>
            )}

            {/* Customer Information Section */}
            {campaign.reward && (
              <>
                <Divider style={{ margin: isMobile ? '16px 0' : '24px 0' }}>Contact Information</Divider>
                
                <Form.Item>
                  <Checkbox
                    checked={optOutOfContest}
                    onChange={(e) => setOptOutOfContest(e.target.checked)}
                  >
                    Do not enter contest
                  </Checkbox>
                </Form.Item>

                {!optOutOfContest && (
                  <>
                    <Form.Item
                      name="name"
                      label="Name"
                      rules={[{ required: true, message: 'Please enter your name' }]}
                      style={{ marginBottom: isMobile ? 12 : 16 }}
                    >
                      <Input placeholder="Enter your full name" size={isMobile ? 'middle' : 'large'} />
                    </Form.Item>

                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { 
                          validator: (_, value) => {
                            if (!value || isValidEmail(value)) {
                              return Promise.resolve();
                            }
                            return Promise.reject('Please enter a valid email address');
                          }
                        }
                      ]}
                      style={{ marginBottom: isMobile ? 12 : 16 }}
                    >
                      <Input type="email" placeholder="Enter your email" size={isMobile ? 'middle' : 'large'} />
                    </Form.Item>

                    <Form.Item
                      name="phone"
                      label="Phone Number"
                      rules={[
                        { required: true, message: 'Please enter your phone number' },
                        { 
                          validator: (_, value) => {
                            if (!value || isValidPhone(value)) {
                              return Promise.resolve();
                            }
                            return Promise.reject('Please enter a valid phone number');
                          }
                        }
                      ]}
                      style={{ marginBottom: isMobile ? 12 : 16 }}
                    >
                      <Input 
                        placeholder="(123) 456-7890" 
                        size={isMobile ? 'middle' : 'large'}
                        maxLength={14}
                      />
                    </Form.Item>
                  </>
                )}
              </>
            )}

            {/* Disclaimer */}
            {campaign.guestConnectSetting?.disclaimerText && (
              <Alert
                message={<Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>{campaign.guestConnectSetting.disclaimerText}</Text>}
                type="info"
                style={{ marginTop: isMobile ? 16 : 24, marginBottom: isMobile ? 16 : 24 }}
              />
            )}

            {/* Submit Button */}
            <Form.Item style={{ marginTop: isMobile ? 20 : 32 }}>
              <Button
                type="primary"
                htmlType="submit"
                size={isMobile ? 'large' : 'large'}
                block
                loading={submitting}
              >
                Submit Survey
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default SurveyForm;
