import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  Button,
  Form,
  Input,
  Select,
  Typography,
  notification,
} from "antd";
import { SettingOutlined } from "@ant-design/icons";
import axios from "axios";
import { Content } from "antd/es/layout/layout";
import { Link } from "react-router-dom";

function AuthenticationSettings() {
  const [settings, setSettings] = useState();
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    getSettings();
  }, []);

  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, description) => {
    api[type]({
      message: type[0].toUpperCase() + type.slice(1),
      description,
    });
  };

  function getSettings() {
    axios.get(`/api/settings/`, { withCredentials: true }).then((response) => {
      setSettings(response.data);
      setSsoEnabled(response.data?.sso?.enabled);
    });
  }

  function update(form) {
    setProcessing(true);
    console.log(form);
    axios
      .post("/api/settings/sso", form, { withCredentials: true })
      .then(() => {
        openNotificationWithIcon("success", "Settings have been saved");
      })
      .catch((error) => {
        openNotificationWithIcon("error", JSON.stringify(error));
      })
      .finally(() => {
        setProcessing(false);
      });
  }

  return (
    <div>
      <Typography.Title level={3}>
        <SettingOutlined /> Authentication
      </Typography.Title>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          {
            title: <Link to="/">Home</Link>,
          },
          {
            title: "Settings",
          },
          {
            title: "Authentication",
          },
        ]}
      />

      <Content style={{ padding: 20, backgroundColor: "white" }}>
        {settings?.sso ? (
          <Form layout="vertical" style={{ maxWidth: 400 }} onFinish={update}>
            <Form.Item
              name="enabled"
              label="Authentication method"
              required
              initialValue={settings?.sso?.enabled}
            >
              <Select
                name="ssoEnabled"
                onChange={setSsoEnabled}
                defaultValue={settings?.sso?.enabled}
                options={[
                  { value: false, label: "Local authentication" },
                  { value: true, label: "SSO and Local authentication" },
                ]}
              />
            </Form.Item>
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              SAML Settings
            </Typography.Title>
            <Form.Item
              name="issuer"
              label="Issuer"
              required={ssoEnabled}
              initialValue={settings?.sso?.issuer}
            >
              <Input
                defaultValue={settings?.sso?.issuer}
                disabled={!ssoEnabled}
              />
            </Form.Item>
            <Form.Item
              name="entryPoint"
              label="Entrypoint"
              required={ssoEnabled}
              initialValue={settings?.sso?.entryPoint}
            >
              <Input
                defaultValue={settings?.sso?.entryPoint}
                disabled={!ssoEnabled}
              />
            </Form.Item>
            <Form.Item
              name="certificate"
              label="Certificate"
              required={ssoEnabled}
              initialValue={settings?.sso?.certificate}
            >
              <Input.TextArea
                rows={4}
                defaultValue={settings?.sso?.certificate}
                disabled={!ssoEnabled}
              />
            </Form.Item>
            <Form.Item
              name="adminGroup"
              label="Admin group"
              initialValue={settings?.sso?.adminGroup}
            >
              <Input
                rows={4}
                defaultValue={settings?.sso?.adminGroup}
                disabled={!ssoEnabled}
              />
            </Form.Item>
            <Form.Item label="Callback URL">
              <Input
                value={`${window.location.origin}/api/sso/callback`}
                disabled
              />
            </Form.Item>
            <Form.Item>
              <Button
                loading={processing}
                htmlType="submit"
                style={{ width: "100%" }}
                type="primary"
              >
                Save changes
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <></>
        )}
      </Content>
      {contextHolder}
    </div>
  );
}

export default AuthenticationSettings;
