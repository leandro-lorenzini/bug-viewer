import React, { useState } from "react";
import { Input, Form, Drawer, Button, Row, Col, Typography } from "antd";
import axios from "axios";
import ParserHelp from "./ParserHelp";

function UpdateParser(props) {
  const [processing, setProcessing] = useState(false);

  const updateParser = (form) => {
    setProcessing(true);
    axios
      .patch(`/api/parser/${props.parser._id}`, form, { withCredentials: true })
      .then(() => {
        props.onSuccess();
      })
      .catch((error) => {
        props.onError(JSON.stringify(error.response.data||error));
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  return (
    <Drawer title="Update parser" open={true} onClose={props.onCancel} size="large">
      <Form layout="vertical" onFinish={updateParser}>
        <Row>
          <Col span={24}>
            <Form.Item name="name" required label="Parser name" initialValue={props.parser.name}>
              <Input placeholder="Parser name" defaultValue={props.parser.name} />
            </Form.Item>
            <Form.Item name="description" required label="Parser description" initialValue={props.parser.description}>
              <Input placeholder="Parser description" defaultValue={props.parser.description} />
            </Form.Item>
            <Form.Item name="rootPath" label="JSON Root path" initialValue={props.parser.rootPath}>
              <Input placeholder="JSON Root path" defaultValue={props.parser.rootPath} />
            </Form.Item>
            <Form.Item name="unwind" label="Unwind field" initialValue={props.parser.unwind}>
              <Input placeholder="JSON Root path" defaultValue={props.parser.unwind} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20}>
          <Col span={12}>
            <Typography.Title style={{ marginTop: 0 }} level={5}>Field mapping</Typography.Title>
            <Form.Item name={['fields', 'title']} label="Title" initialValue={props.parser.fields.title}>
              <Input placeholder="Title" defaultValue={props.parser.fields.title} />
            </Form.Item>
            <Form.Item name={['fields', 'message']} label="Message" initialValue={props.parser.fields.message}>
              <Input placeholder="Message" defaultValue={props.parser.fields.message} />
            </Form.Item>
            <Form.Item name={['fields', 'ruleId']} label="Rule ID" initialValue={props.parser.fields.ruleId}>
              <Input placeholder="Rule ID" defaultValue={props.parser.fields.ruleId} />
            </Form.Item>
            <Form.Item name={['fields', 'url']} label="URL" initialValue={props.parser.fields.url}>
              <Input placeholder="URL" defaultValue={props.parser.fields.url} />
            </Form.Item>
            <Form.Item name={['fields', 'impact']} label="Impact" initialValue={props.parser.fields.impact}>
              <Input placeholder="Impact" defaultValue={props.parser.fields.impact} />
            </Form.Item>
            <Form.Item name={['fields', 'resource']} label="Resource" initialValue={props.parser.fields.resource}>
              <Input placeholder="Resource" defaultValue={props.parser.fields.resource} />
            </Form.Item>
            <Form.Item name={['fields', 'severity']} label="Severity" initialValue={props.parser.fields.severity}>
              <Input placeholder="Severity" defaultValue={props.parser.fields.severity} />
            </Form.Item>
            <Form.Item name={['fields', 'file']} label="File" initialValue={props.parser.fields.file}>
              <Input placeholder="File" defaultValue={props.parser.fields.file} />
            </Form.Item>
            <Form.Item name={['fields', 'line']} label="Line" initialValue={props.parser.fields.line}>
              <Input placeholder="Line" defaultValue={props.parser.fields.line} />
            </Form.Item>
            <Form.Item name={['fields', 'package']} label="Package" initialValue={props.parser.fields.package}>
              <Input placeholder="Package" defaultValue={props.parser.fields.package} />
            </Form.Item>
            <Form.Item name={['fields', 'version']} label="Version" initialValue={props.parser.fields.version}>
              <Input placeholder="Version" defaultValue={props.parser.fields.version} />
            </Form.Item>
            <Form.Item name={['fields', 'resolution']} label="Resolution" initialValue={props.parser.fields.resolution}>
              <Input placeholder="Resolution" defaultValue={props.parser.fields.resolution} />
            </Form.Item>
            <Form.Item name={['fields', 'cve']} label="CVE" initialValue={props.parser.fields.cve}>
              <Input placeholder="CVE" defaultValue={props.parser.fields.cve} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Typography.Title style={{ marginTop: 0 }} level={5}>Severity mapping</Typography.Title>
            <Form.Item name={['severities', 'critical']} label="Critical Severity" initialValue={props.parser.severities?.critical}>
              <Input placeholder="Critical" defaultValue={props.parser.severities?.critical} />
            </Form.Item>
            <Form.Item name={['severities', 'high']} label="High Severity" initialValue={props.parser.severities?.high}>
              <Input placeholder="High" defaultValue={props.parser.severities?.high} />
            </Form.Item>
            <Form.Item name={['severities', 'medium']} label="Medium Severity" initialValue={props.parser.severities?.medium}>
              <Input placeholder="Medium" defaultValue={props.parser.severities?.medium} />
            </Form.Item>
            <Form.Item name={['severities', 'low']} label="Low Severity" initialValue={props.parser.severities?.low}>
              <Input placeholder="Low" defaultValue={props.parser.severities?.low} />
            </Form.Item>
            <Form.Item name={['severities', 'negligible']} label="Negligible Severity" initialValue={props.parser.severities?.negligible}>
              <Input placeholder="Negligible" defaultValue={props.parser.severities?.negligible} />
            </Form.Item>
            <ParserHelp />

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

export default UpdateParser;
