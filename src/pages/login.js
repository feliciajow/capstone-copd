import React, { useState } from 'react';
import { Button, Row, Col, Form, Input, Flex, Modal, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import './style.css';
import Dashboard from './dashboard';

const Login = () => {
  const navigate = useNavigate();
  //open modal pop up
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true)
  }
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleConfirm = () => {
    setIsModalOpen(true);
  }
  //submit buttons
  const onFinish = (values) => {
    console.log('Success:', values);
    navigate('/dashboard');
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="login-container" style={{ padding: "60px" }}>
      <Row>
        <h1>Login</h1>
      </Row>
      <br />
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
          <Input placeholder='Enter your email' />
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
              min: 8 ,
              message: 'Passwords must be at least 8 characters long.'
            }
          ]}
          hasFeedback
        >
          <Input.Password placeholder='Enter your password' />
        </Form.Item>

        <Form.Item label={null}>
          <Row>
            <Col span={6}>
              <Flex justify="space-between" align="left">
                <a href='#' onClick={openModal}>Forgot password</a>
              </Flex>
              <a href='/about'> Continue as guest</a>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Button className="login-btns" type="primary" style={{ width: "100%", marginTop: "10px", backgroundColor: "#29b6f6" }} htmlType="submit">
                Login
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Button className="register-btns" type="default" onClick={() => navigate('/signup')}>
                Register
              </Button>
            </Col>
          </Row>
        </Form.Item>
      </Form>
      <Modal open={isModalOpen} footer={null} closable={false}>
        <Result
          title="Forgot Password"
          extra={[
            <Form>
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
                <Input placeholder="Enter your email" />
              </Form.Item>
              <Form.Item>
                <Button className="forgotpwd-btns" type="default" htmlType="submit">
                  Next
                </Button>
              </Form.Item>
            </Form>

          ]}
        />
      </Modal>
    </div>

  );
};

export default Login;