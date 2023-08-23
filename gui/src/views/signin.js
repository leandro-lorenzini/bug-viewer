import { Form, Input, Button, Space } from "antd";
import { UserOutlined, LockOutlined, BugOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import axios from "axios";

function Signin(props) {
  const [options, setOptions] = useState();
  const [loading, setLoading] = useState();

  useState(() => {
    axios
      .get("/api/auth/options", { withCredentials: true })
      .then((response) => {
        setOptions(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  });

  const onFinish = (values) => {
    setLoading(true);
    axios
      .post("/api/auth", values)
      .then((response) => {
        props.setUser(response.data);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
      });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: '#f5f5f5'
      }}
    >
      <Form
        disabled={loading}
        name="normal_login"
        style={{ width: 300 }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        <div style={{ fontSize: 25, textAlign: "center", marginBottom: 30 }}>
          <span style={{ marginRight: 5 }}>BugViewer</span>
          <BugOutlined />
        </div>

        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Please input your Username!",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Username"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your Password!",
            },
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon" />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item>
          <Space direction="vertical" style={{ display: "flex" }}>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Log in
            </Button>
            {options?.sso ? (
              <Button
                type="dashed"
                htmlType="button"
                style={{ width: "100%" }}
                onClick={() => {
                  window.location.href = "/api/auth/sso";
                }}
              >
                Log in using SSO
              </Button>
            ) : (
              <></>
            )}
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Signin;
