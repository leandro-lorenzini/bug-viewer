import React, { useEffect, useState } from "react";
import {
  Input,
  Pagination,
  Breadcrumb,
  Typography,
  notification,
  Popconfirm,
  Table,
  Space,
  Button,
  Tooltip,
  Tag,
  Row,
  Col,
  Switch
} from "antd";
import {
  BugOutlined,
  BranchesOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import axios from "axios";
import queryString from "query-string";
import { Content } from "antd/es/layout/layout";
import { useNavigate, Link, useSearchParams } from "react-router-dom";

function Branches() {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [page, setPage] = useState(null);
  const [total, setTotal] = useState({});
  const [ref, setRef] = useState(null);

  const [providers, setProviders] = useState([]);
  const [parsers, setParsers] = useState([]);

  const [detailed, setDetailed] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    getResults(ref, 1);
    getParsers();
  }, [ref]);

  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, description) => {
    api[type]({
      message: type[0].toUpperCase() + type.slice(1),
      description,
    });
  };

  function getResults(ref, page) {
    setLoading(true);
    let query = queryString.stringify({
      repository: searchParams.get('repository'),
      ref,
      page,
    });
    axios
      .get(`/api/repository/branch?` + query, {
        withCredentials: true,
      })
      .then((response) => {

        let providers = []
        for (let result of response.data.results.data) {
          for (let provider of (result.providers || [])) {
            if (!providers.includes(provider.name)) {
              providers.push(provider.name);
            }
          }
        }
        setProviders(providers.sort());

        setBranches(response.data.results.data);
        setTotal(response.data.results.total);
        setPage(response.data.page);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function getParsers() {
    axios
      .get("/api/parser?page=1", { withCredentials: true })
      .then((response) => {
        setParsers(response.data.results.data);
      })
  }

  function removeBranch(branch) {
    axios
      .delete(`/api/repository/${searchParams.get('repository')}/branch/${branch}`)
      .then(() => {
        openNotificationWithIcon("success", "Branch has been removed.");
        getResults(ref, 1);
      })
      .catch(() => {
        openNotificationWithIcon("error", "Branch could not be removed.");
      });
  }

  const getSeverity = (severity, number) => {
    const levels = {
      CRITICAL: (
        <Tag color="#9f2017">{ number } C</Tag>
      ),
      HIGH: (
        <Tag color="#FF3200">{ number } H</Tag>
      ),
      MEDIUM: (
        <Tag color="#FFA500">{ number } M</Tag>
      ),
      LOW: (
        <Tag color="#1CA3EC">{ number } L</Tag>
      ),
      NEGLIGIBLE: (
        <Tag color="#999999">{ number } N</Tag>
      ),
    }
    return levels[severity];
  };

  return (
    <div>
      <Typography.Title level={3}>
        <BranchesOutlined /> Branches - {searchParams.get('repositoryName')}
      </Typography.Title>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          {
            title: <Link to="/">Repositories</Link>,
          },
          {
            title: "Branches",
          },
        ]}
      />

      <Content style={{ padding: 20, backgroundColor: "white" }}>
      <Row>
          <Col span={12}>
            <Input.Search
              loading={loading}
              allowClear={true}
              placeholder="Search"
              onEmptied={() => {
                setRef("");
              }}
              onSearch={(ref) => {
                setRef(ref);
              }}
              style={{
                width: 250,
                marginBottom: 10,
              }}
            />
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Switch checkedChildren="Detailed view" unCheckedChildren="Detailed view" onChange={(checked) => {
              setDetailed(checked);
            }}/>
          </Col>
        </Row>

        <Table loading={loading} pagination={false} dataSource={branches} scroll={ detailed ? { x: providers.length * 500 }: {}} columns={[
          {
            title: 'Branch ref', dataIndex: 'ref', key: 'ref', width: '10%',  fixed: 'left'
          },
          {
            title: 'Findings on main/master', 
            render: (_, record) => {
              let critical = 0;
              let high = 0;
              let medium = 0;
              let low = 0;
              if (record.providers) {
                for (let provider of record.providers) {
                  critical += provider.critical;
                  high += provider.high;
                  medium += provider.medium;
                  low += provider.low;
                }
              }
              if (critical + high + medium > 0) {
                return (
                  <Space>
                    { getSeverity('CRITICAL', critical)}
                    { getSeverity('HIGH', high)}
                    { getSeverity('MEDIUM', medium)}
                    { getSeverity('LOW', low)}
                  </Space>
                );
              } else {
                return <>-</>;
              }
            
            }
          },
          {
            title: 'Findings',
            children: providers.map(provider => { return { 
              title: parsers?.filter(parser =>  parser.name === provider)
                .map(p => <Tooltip title={p.description}>
                  <span>
                    {provider}
                    <InfoCircleOutlined style={{ marginLeft: 5 }} />
                  </span>
                </Tooltip>) || provider,
              render: (_, record) => {
                return <>
                  { record.providers?.filter(p => p.name === provider)[0] ? <>
                    { getSeverity('CRITICAL', record.providers?.filter(p => p.name === provider)[0]?.critical) }
                    { getSeverity('HIGH', record.providers?.filter(p => p.name === provider)[0]?.high) }
                    { getSeverity('MEDIUM', record.providers?.filter(p => p.name === provider)[0]?.medium) }
                    { getSeverity('LOW', record.providers?.filter(p => p.name === provider)[0]?.low) }
                    { getSeverity('NEGLIGIBLE', record.providers?.filter(p => p.name === provider)[0]?.negligible) }</> : <>-</> }
                </>
              }
            }})
          },
          {
            title: 'Last scanned', key: 'lastScan', dataIndex: 'updatedAt', render: (updatedAt) => (updatedAt ? new Date(updatedAt).toLocaleString() : '-')
          },
          {
            title: 'Actions', key: 'Actions', width: '10%', fixed: 'right', render: (_, record) => (
              <Space direction={detailed ? 'vertical':'horizontal'}>
                <Popconfirm
                    title="Remove branch"
                    description="Are you sure to remove this parser?"
                    onConfirm={() => {
                      removeBranch(record._id);
                    }}
                    okText="Yes"
                    cancelText="No"
                  >
                  <Button type="link" danger icon={<DeleteOutlined/>}>Delete</Button>
                </Popconfirm>
                <Button type="link" icon={<BugOutlined/>} onClick={() => {
                    navigate({ pathname: record._id, search: `?${queryString.stringify({ 
                      repository: searchParams.get('repository'), 
                      repositoryName: searchParams.get('repositoryName'),
                      ref: record.ref
                    })}`});
                    }}>View findings</Button>
              </Space>
            )
          }
        ].filter((col, index) => {
          if (detailed && index === 1 || !detailed && index === 2) {
            return false;
          }
          return true;
        })} />

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Pagination
            total={total}
            current={parseInt(page?.current) || 1}
            pageSize={20}
            showSizeChanger={false}
            disabled={loading}
            onChange={(e) => {
              getResults(ref, e);
            }}
          />
        </div>
      </Content>
      {contextHolder}
    </div>
  );
}

export default Branches;
