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
  Tooltip
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
      .delete("/api/repository/branch/" + branch)
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
    <div>
      <Typography.Title level={3}>
        <BranchesOutlined /> Branches - {searchParams.get('repository')}
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

        <Table loading={loading} pagination={false} dataSource={branches} columns={[
          {
            title: 'Branch ref', dataIndex: 'ref', key: 'ref', width: '10%'
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
            title: 'Last scanned', dataIndex: 'updatedAt', key: 'updatedAt', width: '15%'
          },
          {
            title: 'Actions', key: 'Actions', width: '10%',  render: (_, record) => (
              <Space>
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
                    navigate({ pathname: record._id, search: `?${queryString.stringify({ repository: searchParams.get('repository')})}` });
                    }}>View findings</Button>
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
