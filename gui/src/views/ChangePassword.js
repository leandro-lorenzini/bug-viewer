import React, { useState } from "react";
import { Input, Form, Drawer, Button } from "antd";
import axios from "axios";

function ChangePassword(props) {
  const [processing, setProcessing] = useState(false);

  const changePassword = (form) => {
    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match.");
    }
    setProcessing(true);
    axios
      .post(
        "/api/auth/change-password",
        { password: form.password },
        { withCredentials: true }
      )
      .then(() => {
        props.onSuccess();
      })
      .catch((error) => {
        props.onError(error);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <Drawer title="Change password" open={true} onClose={props.onCancel}>
      <Form layout="vertical" onFinish={changePassword}>
        <Form.Item name="password" required label="Password">
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item name="confirmPassword" required label="Confirm password">
          <Input.Password placeholder="Confirm password" />
        </Form.Item>
        <Form.Item>
          <Button
            loading={processing}
            type="primary"
            htmlType="submit"
            style={{ width: "100%" }}
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}

export default ChangePassword;
