import { Avatar, Card, Col, Row, Skeleton, Space, Tag, Typography } from "antd";
import { Content } from "antd/es/layout/layout";
import {
  CodeOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  EyeInvisibleOutlined,
  AppstoreAddOutlined,
  SafetyOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import Stats from "./Stats";

export default function Summary(props) {
  function getTotalPerType(type) {
    let results = props.branch.findings.filter((finding) =>
      props.parsers
        .filter((parser) => parser.type === type)
        .map((parser) => parser.name)
        .includes(finding?.provider)
    );
    results = results.reduce(
      (acc, current) => {
        acc.high += current.high;
        acc.medium += current.medium;
        acc.low += current.low;
        acc.critical += current.critical;
        acc.negligible += current.negligible;
        return acc;
      },
      { high: 0, medium: 0, low: 0, critical: 0, negligible: 0 }
    );

    return (
      <Space style={{ marginTop: 10 }}>
        <Tag color="#9f2017">{results.critical} C</Tag>
        <Tag color="#FF3200">{results.high} H</Tag>
        <Tag color="#FFA500">{results.medium} M</Tag>
        <Tag color="#1CA3EC">{results.low} L</Tag>
      </Space>
    );
  }

  const noVulnerabilities = (
    <Space style={{ marginTop: 10 }}>
      <Tag color="#9f2017">0 C</Tag>
      <Tag color="#FF3200">0 H</Tag>
      <Tag color="#FFA500">0 M</Tag>
      <Tag color="#1CA3EC">0 L</Tag>
    </Space>
  );

  function getRating() {
    let result = props.branch.findings.reduce(
      (acc, current) => {
        acc.critical += current.critical; // E
        acc.high += current.high; //D
        acc.medium += current.medium; //C
        acc.low += current.low; // B
        acc.negligible += current.negligible; //A;
        return acc;
      },
      { high: 0, medium: 0, low: 0, critical: 0, negligible: 0 }
    );

    if (result.critical) {
      return (
        <>
          <Space>
            <Avatar shape="square" style={{ backgroundColor: "#9f2017" }}>
              E
            </Avatar>
            <Typography.Text style={{ margin: 0, fontSize: 13 }}>
              Critical level vulnerabilities found.
            </Typography.Text>
          </Space>
        </>
      );
    }

    if (result.high) {
      return (
        <>
          <Space>
            <Avatar shape="square" style={{ backgroundColor: "#FF3200" }}>
              D
            </Avatar>
            <Typography.Text style={{ margin: 0, fontSize: 13 }}>
              Critical level vulnerabilities found.
            </Typography.Text>
          </Space>
        </>
      );
    }

    if (result.medium) {
      return (
        <>
          <Space>
            <Avatar shape="square" style={{ backgroundColor: "#FFA500" }}>
              C
            </Avatar>
            <Typography.Text style={{ margin: 0 }}>
              Medium level vulnerabilities found.
            </Typography.Text>
          </Space>
        </>
      );
    }

    if (result.low) {
      return (
        <>
          <Space>
            <Avatar shape="square" style={{ backgroundColor: "#1CA3EC" }}>
              B
            </Avatar>
            <Typography.Text style={{ margin: 0 }}>
              Low level vulnerabilities found.
            </Typography.Text>
          </Space>
        </>
      );
    }
    return (
      <Space>
        <Avatar shape="square" style={{ backgroundColor: "green" }}>
          A
        </Avatar>
        <Typography.Text style={{ margin: 0 }}>
          No serious vulnerabilities found.
        </Typography.Text>
      </Space>
    );
  }

  return (
    <Row>
      <Col span={18} style={{ paddingRight: 10 }}>
        <Content style={{ padding: 20, backgroundColor: "white" }}>
          {props.loading ? (
            <Skeleton active />
          ) : (
            <>
              <Row gutter={12}>
                <Col span={8} style={{ marginBottom: 10 }}>
                  <Card>
                    <Typography.Title style={{ marginTop: 0 }} level={5}>
                      <CodeOutlined /> Code vulnerabilities
                    </Typography.Title>
                    {props.branch?.findings
                      ? getTotalPerType("code")
                      : noVulnerabilities}
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Typography.Title style={{ marginTop: 0 }} level={5}>
                      <EyeInvisibleOutlined /> Hardcoded secrets
                    </Typography.Title>
                    {props.branch?.findings
                      ? getTotalPerType("secret")
                      : noVulnerabilities}
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Typography.Title style={{ marginTop: 0 }} level={5}>
                      <ClusterOutlined /> Infrastructure vulnerabilities
                    </Typography.Title>
                    {props.branch?.findings
                      ? getTotalPerType("infrastructure")
                      : noVulnerabilities}
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Typography.Title style={{ marginTop: 0 }} level={5}>
                      <AppstoreOutlined /> Image vulnerabilities
                    </Typography.Title>
                    {props.branch?.findings
                      ? getTotalPerType("image")
                      : noVulnerabilities}
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Typography.Title style={{ marginTop: 0 }} level={5}>
                      <AppstoreAddOutlined /> Package dependency
                    </Typography.Title>
                    {props.branch?.findings
                      ? getTotalPerType("package")
                      : noVulnerabilities}
                  </Card>
                </Col>
              </Row>

              <Row style={{ marginTop: 10 }}>
                {props.branch?.scans ? (
                  <Stats scans={props.branch?.scans} />
                ) : (
                  <></>
                )}
              </Row>
            </>
          )}
        </Content>
      </Col>
      <Col span={6} style={{ paddingRight: 10 }}>
        <Card style={{ paddingBottom: 0 }}>
          {props.loading ? (
            <Skeleton active />
          ) : (
            <>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                <SafetyOutlined /> Security Rating
              </Typography.Title>
              {props.branch?.findings ? (
                getRating()
              ) : (
                <>
                  <Space>
                    <Avatar shape="square" style={{ backgroundColor: "green" }}>
                      A
                    </Avatar>
                    <Typography.Text style={{ margin: 0 }}>
                      No serious vulnerabilities found.
                    </Typography.Text>
                  </Space>
                </>
              )}

              <Typography.Title level={5}>
                <CalendarOutlined /> Last scanned date
              </Typography.Title>
              <Typography.Text>
                { new Date(props.branch.scans?.slice(-1)[0]?.createdAt).toUTCString()}
              </Typography.Text>

            </>
          )}
        </Card>
      </Col>
    </Row>
  );
}
