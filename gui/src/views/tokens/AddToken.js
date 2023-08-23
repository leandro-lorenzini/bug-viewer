import React, { useState } from "react";
import { Input, Form, Drawer, Button } from "antd";
import axios from "axios";

function AddToken(props) {
  const [processing, setProcessing] = useState(false);

  const createToken = (form) => {
    setProcessing(true);
    axios
      .post("/api/token", form, { withCredentials: true })
      .then((response) => {
        props.onSuccess(response.data.token);
      })
      .catch((error) => {
        props.onError(error);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <Drawer title="New token" open={true} onClose={props.onCancel}>
      <Form layout="vertical" onFinish={createToken}>
        <Form.Item name="description" required label="Description">
          <Input placeholder="Description" />
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

export default AddToken;
