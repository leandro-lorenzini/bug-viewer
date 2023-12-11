import React, { useState } from "react";
import { Input, Form, Select, Drawer, Button } from "antd";
import axios from "axios";

function UpdateUser(props) {
  const [processing, setProcessing] = useState(false);

  const createUser = (form) => {
    setProcessing(true);
    axios
      .patch(`${process.env.REACT_APP_API_URL || '/api/'}user/${props.userId}`, form, { withCredentials: true })
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
    <Drawer title="Update user" open={true} onClose={props.onCancel}>
      <Form layout="vertical" onFinish={createUser}>
        <Form.Item
          name="email"
          required
          label="E-mail address"
          initialValue={props.email}
        >
          <Input defaultValue={props.email} placeholder="E-mail address" />
        </Form.Item>
        <Form.Item
          name="admin"
          required
          label="Access rights"
          initialValue={props.admin}
        >
          <Select
            defaultValue={props.admin}
            options={[
              { value: false, label: "Standard user" },
              { value: true, label: "Administrator" },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          help="Only fill out this field if you want to update the password."
        >
          <Input.Password placeholder="Password" />
        </Form.Item>

        <Form.Item style={{ paddingTop: 15 }}>
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

export default UpdateUser;
