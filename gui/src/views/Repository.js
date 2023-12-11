import {
  Avatar,
  Breadcrumb,
  Card,
  Col,
  Dropdown,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { Content } from "antd/es/layout/layout";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CodeOutlined,
  AppstoreOutlined,
  ClusterOutlined,
  BranchesOutlined,
  EyeInvisibleOutlined,
  AppstoreAddOutlined,
  SafetyOutlined,
  DownOutlined,
} from "@ant-design/icons";
import Stats from "./Stats";
import Findings from "./Findings";

function Repository() {
  const [loading, setLoading] = useState(true);
  const [repository, setRepository] = useState(true);
  const { repositoryId } = useParams();
  const [branch, setBranch] = useState();
  const [parsers, setParsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [rating, setRating] = useState(0);

  function getRepository() {
    axios
      .get(
        `${process.env.REACT_APP_API_URL || "/api/"}repository/${repositoryId}`,
        { withCredentials: true }
      )
      .then((response) => {
        setRepository(response.data);
        response.data?.branches?.forEach((branch) => {
          if (branch.ref === response.data.head) {
            getBranch(branch._id);
          }
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function getParsers() {
    axios
      .get(`${process.env.REACT_APP_API_URL || "/api/"}parser?page=1`, {
        withCredentials: true,
      })
      .then((response) => {
        setParsers(response.data.results.data);
      });
  }

  function getBranch(branchId) {
    axios
      .get(
        `${
          process.env.REACT_APP_API_URL || "/api/"
        }repository/${repositoryId}/branch/${branchId}`,
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        setBranch(response.data);
      });
  }

  function getTotalPerType(type) {
    let results = branch.findings.filter((finding) =>
      parsers
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
    let result = branch.findings.reduce(
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
    return;
  }

  useEffect(() => {
    getParsers();
    if (1 < 2) {
      getRepository();
    } else {
      getBranch();
    }
  }, []);

  const summary = <Row>
  <Col span={18} style={{ paddingRight: 10 }}>
    <Content style={{ padding: 20, backgroundColor: "white" }}>
      <Row gutter={12}>
        <Col span={8} style={{ marginBottom: 10 }}>
          <Card>
            <Typography.Title style={{ marginTop: 0 }} level={5}>
              <CodeOutlined /> Code vulnerabilities
            </Typography.Title>
            {branch?.findings
              ? getTotalPerType("code")
              : noVulnerabilities}
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Typography.Title style={{ marginTop: 0 }} level={5}>
              <EyeInvisibleOutlined /> Hardcoded secrets
            </Typography.Title>
            {branch?.findings
              ? getTotalPerType("secret")
              : noVulnerabilities}
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Typography.Title style={{ marginTop: 0 }} level={5}>
              <ClusterOutlined /> Infrastructure vulnerabilities
            </Typography.Title>
            {branch?.findings
              ? getTotalPerType("infrastructure")
              : noVulnerabilities}
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Typography.Title style={{ marginTop: 0 }} level={5}>
              <AppstoreOutlined /> Image vulnerabilities
            </Typography.Title>
            {branch?.findings
              ? getTotalPerType("image")
              : noVulnerabilities}
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Typography.Title style={{ marginTop: 0 }} level={5}>
              <AppstoreAddOutlined /> Package dependency
            </Typography.Title>
            {branch?.findings
              ? getTotalPerType("package")
              : noVulnerabilities}
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 10 }}>
        {branch?.scans ? <Stats scans={branch?.scans} /> : <></>}
      </Row>
    </Content>
  </Col>
  <Col span={6} style={{ paddingRight: 10 }}>
    <Card style={{ paddingBottom: 0 }}>
      <Typography.Title level={5} style={{ marginTop: 0 }}>
        {" "}
        <SafetyOutlined /> Security Rating
      </Typography.Title>
      {branch?.findings ? (
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
    </Card>
  </Col>
</Row>

  return (
    <div>
      <Typography.Title level={3}>
        <BranchesOutlined /> {repository?.name} -
        <Dropdown
          menu={{
            items: repository?.branches?.map((branch) => {
              return { key: branch._id, label: branch.ref };
            }),
          }}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <span style={{ paddingLeft: 10 }}>{branch?.ref}</span>
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
      </Typography.Title>
      
      <Tabs items={[
            { 
              key: 'Summary',
              label: 'Summary',
              children: summary
            },
            {
              key: 'Vulnerabilities',
              label: 'Vulnerabilities',
              children: branch && repository ? <Findings branch={branch} repository={repository} />:<></>
            }
      ]}/>

      
    </div>
  );
}

export default Repository;
