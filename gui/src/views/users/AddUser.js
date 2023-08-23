import React, { useState } from "react";
import { Input, Form, Select, Drawer, Button } from "antd";
import axios from "axios";

function AddUser(props) {
  const [processing, setProcessing] = useState(false);

  const createUser = (form) => {
    setProcessing(true);
    axios
      .post("/api/user", form, { withCredentials: true })
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
    <Drawer title="New user" open={true} onClose={props.onCancel}>
      <Form layout="vertical" onFinish={createUser}>
        <Form.Item name="email" required label="E-mail address">
          <Input placeholder="E-mail address" />
        </Form.Item>
        <Form.Item name="password" required label="Password">
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item name="admin" required label="Access rights">
          <Select
            defaultValue={false}
            options={[
              { value: false, label: "Standard user" },
              { value: true, label: "Administrator" },
            ]}
          />
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

export default AddUser;
