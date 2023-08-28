import React, { useEffect, useState } from "react";
import {
  Input,
  Pagination,
  Typography,
  Breadcrumb,
  Table,
  Space,
  Button,
  Tooltip
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
        <div style={{ color: "red" }}>
          <ExclamationCircleOutlined /> { number } critical
        </div>
      ),
      HIGH: (
        <div style={{ color: "brown" }}>
          <ExclamationCircleOutlined /> { number } High
        </div>
      ),
      MEDIUM: (
        <div style={{ color: "orange" }}>
          <ExclamationCircleOutlined /> { number } Medium
        </div>
      ),
      LOW: (
        <div style={{ color: "black" }}>
          <ExclamationCircleOutlined /> { number } Low
        </div>
      ),
      NEGLIGIBLE: (
        <div style={{ color: "grey" }}>
          <ExclamationCircleOutlined /> { number } Negligibile
        </div>
      ),
    }
    return number ? levels[severity] : null;
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

        <Table loading={loading} pagination={false} dataSource={repositories} scroll={{ x: 1600 }} columns={[
          {
            title: 'Repository name', dataIndex: 'repository', key: 'repository', fixed: 'left'
          },
          {
            title: 'Findings on main branch',
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
                    { getSeverity('MEDIUM', record.providers?.filter(p => p.name === provider)[0]?.medium) }</> : <>-</> }
                </>
              }
            }})
          },
          {
            title: 'Last scanned', key: 'lastScan', dataIndex: 'updatedAt', width: '15%', render: (updatedAt) => (new Date(updatedAt).toLocaleString())
          },
          {
            title: '', key: 'Actions', fixed: 'right', render: (_, record) => (
              <Space>
                <Button type="link" icon={<BranchesOutlined/>} onClick={() => {
                      navigate({ pathname: 'branch', search: `?${queryString.stringify({ repository: record.repository})}` });
                    }}>Branches</Button>
              </Space>
            )
          }
        ]} />

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
