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
} from "antd";
import {
  BugOutlined,
  BranchesOutlined,
  DeleteOutlined,
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

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    getResults(ref, 1);
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
        setBranches(response.data.results.data);
        setTotal(response.data.results.total);
        setPage(response.data.page);
      })
      .finally(() => {
        setLoading(false);
      });
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
            title: 'Branch ref', dataIndex: 'ref', key: 'ref', width: '50%'
          },
          {
            title: 'Last updated', dataIndex: 'updatedAt', key: 'updatedAt', width: '50%'
          },
          {
            title: 'Actions', key: 'Actions',  render: (_, record) => (
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
