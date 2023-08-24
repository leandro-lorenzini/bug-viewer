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
  RetweetOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
import queryString from "query-string";
import { Content } from "antd/es/layout/layout";
import AddParser from "./AddParser";
import UpdateParser from "./UpdateParser";

function Parser() {
  const [loading, setLoading] = useState(true);
  const [repositories, setRepositories] = useState([]);
  const [page, setPage] = useState(null);
  const [total, setTotal] = useState({});
  const [name, setName] = useState(null);

  const [showNew, setShowNew] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, message, description) => {
    api[type]({
      message: message,
      description,
    });
  };

  useEffect(() => {
    getResults(name, 1);
  }, [name]);

  function getResults(name, page) {
    setLoading(true);
    let query = queryString.stringify({
      name,
      page,
    });

    axios
      .get("/api/parser?" + query, { withCredentials: true })
      .then((response) => {
        setRepositories(response.data.results.data);
        setTotal(response.data.results.total);
        setPage(response.data.page);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function removeParser(parserId) {
    axios
      .delete("/api/parser/" + parserId)
      .then(() => {
        openNotificationWithIcon(
          "success",
          "Success",
          "Parser has been removed."
        );
        getResults(name, 1);
      })
      .catch(() => {
        openNotificationWithIcon(
          "error",
          "Error",
          "Parser could not be removed."
        );
      });
  }

  return (
    <>
      <Typography.Title level={3}>
        <RetweetOutlined /> Parsers
      </Typography.Title>

      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          {
            title: "Home",
          },
          {
            title: "Parsers",
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
            width: 250,
            marginBottom: 10,
          }}
        />
        <Table pagination={false} dataSource={repositories} columns={[
          {
            title: 'Parser name', dataIndex: 'name', key: 'name', width: '20%'
          },
          {
            title: 'Description', dataIndex: 'description', key: 'description', width: '55%'
          },
          {
            title: 'Last updated', dataIndex: 'updatedAt', key: 'updatedAt', width: '15%'
          },
          {
            title: 'Actions', key: 'Actions', render: (_, record) => (
              <Space>
                <Popconfirm
                    title="Remove parser"
                    description="Are you sure to remove this parser?"
                    onConfirm={() => {
                      removeParser(record._id);
                    }}
                    okText="Yes"
                    cancelText="No"
                  >
                  <Button type="link" danger icon={<DeleteOutlined/>}>Delete</Button>
                  </Popconfirm>
                <Button type="link" icon={<EditOutlined/>} onClick={() => {
                      setShowUpdate(record);
                    }}>Edit</Button>
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
      <FloatButton
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setShowNew(true)}
      />
      {contextHolder}

      {showNew ? (
        <AddParser
          onSuccess={() => {
            openNotificationWithIcon(
              "success",
              "Success",
              "Parser was successfuly created."
            );
            getResults(name, 1);
            setShowNew(false);
          }}
          onError={(error) => {
            openNotificationWithIcon(
              "error",
              "Error",
              error?.response?.data || JSON.stringify(error)
            );
          }}
          onCancel={() => setShowNew(false)}
        />
      ) : (
        <></>
      )}

      {showUpdate ? (
        <UpdateParser
          parser={showUpdate}
          onSuccess={() => {
            openNotificationWithIcon(
              "success",
              "Success",
              "Parser was successfuly updated."
            );
            getResults(name, 1);
            setShowUpdate(false);
          }}
          onError={(error) => {
            openNotificationWithIcon(
              "error",
              "Error",
              error.response?.data || JSON.stringify(error)
            );
          }}
          onCancel={() => setShowUpdate(false)}
        />
      ) : (
        <></>
      )}
    </>
  );
}

export default Parser;
