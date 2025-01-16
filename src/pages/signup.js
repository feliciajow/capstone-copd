import React from 'react';
import { Button, Row, Col, Form, Input, Flex } from 'antd';

const onFinish = (values) => {
  console.log('Success:', values);
};
const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const Signup = () => (
  <div className="card-container" style={{ padding: "60px" }}>
    <Row>
      <Col span={2}>
        <h1>Sign up</h1>
      </Col>
    </Row>
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
        name="password"
        rules={[
          {
            required: true,
            message: 'Please input your password!',
          },
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      <Form.Item style={{ textAlign: "left" }}
        name="confirm"
        label="Confirm Password"
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
          <Col span={4}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Col>
          <Col span={14}></Col>
        </Row>
      </Form.Item>
    </Form>
  </div>
);

export default Signup;