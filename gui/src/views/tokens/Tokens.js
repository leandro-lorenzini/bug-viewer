import React, { useEffect, useState } from "react";
import {
  Input,
  Pagination,
  Typography,
  Breadcrumb,
  FloatButton,
  notification,
  Popconfirm,
  Table,
  Space,
  Button,
} from "antd";
import {
  DeleteOutlined,
  KeyOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import axios from "axios";
import queryString from "query-string";
import { Content } from "antd/es/layout/layout";
import AddToken from "./AddToken";

function Tokens() {
  const [loading, setLoading] = useState(true);
  const [repositories, setRepositories] = useState([]);
  const [page, setPage] = useState(null);
  const [total, setTotal] = useState({});
  const [description, setDescription] = useState(null);

  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, message, description) => {
    api[type]({
      message: message,
      description,
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    getResults(description, 1);
  }, [description]);

  function getResults(description, page) {
    setLoading(true);
    let query = queryString.stringify({
      description,
      page,
    });

    axios
      .get("/api/token?" + query, { withCredentials: true })
      .then((response) => {
        setRepositories(response.data.results.data);
        setTotal(response.data.results.total);
        setPage(response.data.page);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function removeToken(tokenId) {
    axios
      .delete("/api/token/" + tokenId)
      .then(() => {
        openNotificationWithIcon(
          "success",
          "Success",
          "Token has been removed."
        );
        getResults(description, 1);
      })
      .catch(() => {
        openNotificationWithIcon(
          "error",
          "Error",
          "Token could not be removed."
        );
      });
  }

  return (
    <>
      <Typography.Title level={3}>
        <KeyOutlined /> Tokens
      </Typography.Title>

      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          {
            title: "Home",
          },
          {
            title: "Tokens",
          },
        ]}
      />
      <Content style={{ backgroundColor: "white", padding: 20 }}>
        <Input.Search
          loading={loading}
          allowClear={true}
          placeholder="Search"
          onEmptied={() => {
            setDescription("");
          }}
          onSearch={(description) => {
            setDescription(description);
          }}
          style={{
            width: 250,
            marginBottom: 10,
          }}
        />
        <Table pagination={false} dataSource={repositories} columns={[
          {
            title: 'Token description', dataIndex: 'description', key: 'description', width: '50%'
          },
          {
            title: 'Last updated', dataIndex: 'updatedAt', key: 'updatedAt', width: '50%', render: (updatedAt) => (updatedAt ? new Date(updatedAt).toLocaleString() : '-')
          },
          {
            title: 'Actions', key: 'Actions', render: (_, record) => (
              <Space>
                <Popconfirm
                    title="Remove parser"
                    description="Are you sure to remove this parser?"
                    onConfirm={() => {
                      removeToken(record._id);
                    }}
                    okText="Yes"
                    cancelText="No"
                  >
                  <Button type="link" danger icon={<DeleteOutlined/>}>Delete</Button>
                  </Popconfirm>
              </Space>
            )
          }
        ]} />
      
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Pagination
            total={total}
            current={parseInt(page?.current) || 1}
            pageSize={10}
            showSizeChanger={false}
            disabled={loading}
            onChange={(e) => {
              getResults(description, e);
            }}
          />
        </div>
      </Content>
      <FloatButton type="primary" icon={<PlusOutlined />} onClick={showModal} />
      { isModalOpen ? <AddToken 
        onSuccess={(token) => {
          openNotificationWithIcon(
            "success",
            "Token sucessfuly created",
            <>
              <Input readOnly={true} value={token} />
            </>
          );
          setIsModalOpen(false);
          getResults(description, 1);
        }} 
        onError={(error) => {
          openNotificationWithIcon(
            "error",
            "An error has happened",
            JSON.stringify(error)
          );
        }}
        />:<></>}
      
      {contextHolder}
    </>
  );
}

export default Tokens;
