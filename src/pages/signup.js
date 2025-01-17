import React from 'react';
import { Button, Row, Col, Form, Input, Flex } from 'antd';
import './style.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const onFinish = (values) => {
    console.log('Success:', values);
    navigate('/login')
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  return (
    <div className="signup-container" style={{ padding: "60px" }}>
      <Row>
        <h1>Sign up</h1>
      </Row>
      <br />
      <Form
        name="basic"
        //positioning of input box
        labelCol={{
          span: 6,
        }}
        //length of input box
        wrapperCol={{
          span: 18,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="on"
      >
        <Form.Item style={{ textAlign: "left" }}
          name="email"
          label="Email"
          labelAlign="left"
          rules={[
            {
              type: 'email',
              message: 'Please enter a valid email!',
            },
            {
              required: true,
              message: 'Please input your email!',
            },
          ]}
          hasFeedback
        >
          <Input />
        </Form.Item>

        <Form.Item style={{ textAlign: "left" }}
          label="Password"
          labelAlign="left"
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your password!',
            },
            {
              //password minimum 8 characters
              min: 8,
              message: 'Passwords must be at least 8 characters long.'
            }
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item style={{ textAlign: "left" }}
          name="confirm"
          label="Confirm Password"
          labelAlign="left"
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please confirm your password!',
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The new password that you entered do not match!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item label={null}>
          <Row>
            <Col span={24}>
              <Button type="primary" style={{ width: "100%", marginTop: "10px", backgroundColor: "#29b6f6" }} htmlType="submit">
                Register
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Button type="default" style={{ width: "100%", marginTop: "10px" }} onClick={() => navigate('/login')}>
                Back to Login
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </div>
  )
};

export default Signup;