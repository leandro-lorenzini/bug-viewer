import React, { useEffect, useState } from "react";
import {
  Input,
  Pagination,
  Typography,
  Breadcrumb,
  Table,
  Space,
  Button,
  Tooltip,
  Switch,
  Col,
  Row,
  Tag
} from "antd";
import {
  BranchesOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import axios from "axios";
import queryString from "query-string";
import { Content } from "antd/es/layout/layout";
import { useNavigate } from "react-router-dom";

function Repositories() {
  const [loading, setLoading] = useState(true);
  const [repositories, setRepositories] = useState([]);
  const [page, setPage] = useState(null);
  const [total, setTotal] = useState({});
  const [name, setName] = useState(null);

  const [parsers, setParsers] = useState([]);
  const [providers, setProviders] = useState([]);

  const [detailed, setDetailed] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getResults(name, 1);
    getParsers();
  }, [name]);

  function getResults(name, page) {
    setLoading(true);
    let query = queryString.stringify({
      name,
      page,
    });

    axios
      .get("/api/repository?" + query, { withCredentials: true })
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
        setRepositories(response.data.results.data);
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
    <>
      <Typography.Title level={3}>
        <BranchesOutlined /> Repositories
      </Typography.Title>

      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          {
            title: "Home",
          },
          {
            title: "Repositories",
          },
        ]}
      />

      <Content style={{ backgroundColor: "white", padding: 20 }}>
        <Row>
          <Col span={12}>
            <Input.Search
              loading={loading}
              allowClear={true}
              placeholder="Search"
              onEmptied={() => {
                setName("");
              }}
              onSearch={(name) => {
                setName(name);
              }}
              style={{
                width: 305,
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
        

        <Table loading={loading} pagination={false} dataSource={repositories} scroll={ detailed ? { x: providers.length * 500 }: {}} columns={[
          {
            title: 'Repository name', dataIndex: 'name', key: 'name', fixed: 'left'
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
              if (critical + high + medium + low > 0) {
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
            title: 'Findings on main/master',
            children: providers.map(provider => { return { 
              title: parsers?.filter(parser =>  parser.name === provider)
                .map(p => <Tooltip title={p.description}>
                  <span>
                    {provider}
                    <InfoCircleOutlined style={{ marginLeft: 5 }} />
                  </span>
                </Tooltip>) || provider,
              render: (_, record) => {
                return <Space>
                  { record.providers?.filter(p => p.name === provider)[0] ? <>
                    { getSeverity('CRITICAL', record.providers?.filter(p => p.name === provider)[0]?.critical) }
                    { getSeverity('HIGH', record.providers?.filter(p => p.name === provider)[0]?.high) }
                    { getSeverity('MEDIUM', record.providers?.filter(p => p.name === provider)[0]?.medium) }
                    { getSeverity('LOW', record.providers?.filter(p => p.name === provider)[0]?.low) }</> : <>-</> }
                </Space>
              }
            }})
          },
          {
            title: 'Last scanned', key: 'lastScan', dataIndex: 'updatedAt', render: (updatedAt) => (updatedAt ? new Date(updatedAt).toLocaleString() : '-')
          },
          {
            title: '', key: 'Actions', width: '10%', fixed: 'right', render: (_, record) => (
              <Space>
                <Button type="link" icon={<BranchesOutlined/>} onClick={() => {
                      navigate({ pathname: 'branch', search: `?${queryString.stringify({ repository: record._id, repositoryName: record.name })}` });
                    }}>Branches</Button>
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
              getResults(name, e);
            }}
          />
        </div>
      </Content>
    </>
  );
}

export default Repositories;
