import React from 'react';
import { Button, Row, Col, Form, Input, Flex } from 'antd';
import { useNavigate } from 'react-router-dom';

const onFinish = (values) => {
  console.log('Success:', values);
};
const onFinishFailed = (errorInfo) => {
  console.log('Failed:', errorInfo);
};

const Login = () => {
  const navigate = useNavigate();
  return (
    <div className="card-container" style={{ padding: "60px" }}>
      <Row>
        <Col span={2}>
          <h1>Login</h1>
        </Col>
      </Row>
      <Form
        name="basic"
        //positioning of input box
        labelCol={{
          span: 4,
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

        <Form.Item label={null}>
          <Row>
            <Col span={6}>
              <Flex justify="space-between" align="left">
                <a href="">Forgot password</a>
              </Flex>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
                <Button style={{width:"100%", marginTop:"10px", backgroundColor:"#29b6f6"}} type="primary" htmlType="submit">
                  <b>Submit</b>
                </Button>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Button style={{width:"100%", marginTop:"10px", backgroundColor:"#29b6f6"}} type="primary" onClick={() => navigate('/signup')}>
                <b>Register</b>
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;