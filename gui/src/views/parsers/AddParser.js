import React, { useState } from "react";
import { Input, Form, Typography, Drawer, Button, Row, Col } from "antd";
import axios from "axios";
import ParserHelp from "./ParserHelp";

function AddParser(props) {
  const [processing, setProcessing] = useState(false);

  const createParser = (form) => {
    setProcessing(true);
    axios
      .post("/api/parser", form, { withCredentials: true })
      .then(() => {
        props.onSuccess();
      })
      .catch((error) => {
        props.onError(JSON.stringify(error.response.data) || error);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <Drawer title="New parser" open={true} onClose={props.onCancel} size="large">
      <Form layout="vertical" onFinish={createParser}>
        <Row>
          <Col span={24}>
            <Form.Item name="name" required label="Parser name">
              <Input placeholder="Parser name" />
            </Form.Item>
            <Form.Item name="rootPath" label="JSON Root path">
              <Input placeholder="JSON Root path" />
            </Form.Item>
            <Form.Item name="unwind" label="Unwind field">
              <Input placeholder="JSON Root path" />
            </Form.Item>
            
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={12}>
            <Typography.Title style={{ marginTop: 0 }} level={5}>Field mapping</Typography.Title>
            <Form.Item name={['fields', 'title']} label="Title">
              <Input placeholder="Title" />
            </Form.Item>
            <Form.Item name={['fields', 'message']} label="Message">
              <Input placeholder="Message" />
            </Form.Item>
            <Form.Item name={['fields', 'ruleId']} label="Rule ID">
              <Input placeholder="Rule ID" />
            </Form.Item>
            <Form.Item name={['fields', 'url']} label="URL">
              <Input placeholder="URL" />
            </Form.Item>
            <Form.Item name={['fields', 'impact']} label="Impact">
              <Input placeholder="Impact" />
            </Form.Item>
            <Form.Item name={['fields', 'resource']} label="Resource">
              <Input placeholder="Resource" />
            </Form.Item>
            <Form.Item name={['fields', 'severity']} label="Severity">
              <Input placeholder="Severity" />
            </Form.Item>
            <Form.Item name={['fields', 'file']} label="File">
              <Input placeholder="File" />
            </Form.Item>
            <Form.Item name={['fields', 'line']} label="Line">
              <Input placeholder="Line" />
            </Form.Item>
            <Form.Item name={['fields', 'package']} label="Package">
              <Input placeholder="Package" />
            </Form.Item>
            <Form.Item name={['fields', 'version']} label="Version">
              <Input placeholder="Version" />
            </Form.Item>
            <Form.Item name={['fields', 'resolution']} label="Resolution">
              <Input placeholder="Resolution" />
            </Form.Item>
            <Form.Item name={['fields', 'cve']} label="CVE">
              <Input placeholder="CVE" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Typography.Title style={{ marginTop: 0 }} level={5}>Severity mapping</Typography.Title>
            <Form.Item name={['severities', 'critical']} label="Critical Severity">
              <Input placeholder="Critical" />
          </Form.Item>
          <Form.Item name={['severities', 'high']} label="High Severity">
            <Input placeholder="High" />
          </Form.Item>
          <Form.Item name={['severities', 'medium']} label="Medium Severity">
            <Input placeholder="Medium" />
          </Form.Item>
          <Form.Item name={['severities', 'low']} label="Low Severity">
            <Input placeholder="Low" />
          </Form.Item>
          <Form.Item name={['severities', 'negligible']} label="Negligible Severity">
            <Input placeholder="Negligible" />
          </Form.Item>
          <ParserHelp/>

          </Col>
        </Row>
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

export default AddParser;
