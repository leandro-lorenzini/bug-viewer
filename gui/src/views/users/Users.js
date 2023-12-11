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
  UsergroupAddOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axios from "axios";
import queryString from "query-string";
import { Content } from "antd/es/layout/layout";
import AddUser from "./AddUser";
import UpdateUser from "./UpdateUser";

function Users() {
  const [loading, setLoading] = useState(true);
  const [repositories, setRepositories] = useState([]);
  const [page, setPage] = useState(null);
  const [total, setTotal] = useState({});
  const [email, setEmail] = useState(null);

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
    getResults(email, 1);
  }, [email]);

  function getResults(email, page) {
    setLoading(true);
    let query = queryString.stringify({
      email,
      page,
    });

    axios
      .get(`${process.env.REACT_APP_API_URL || '/api/'}user/?${query}`, { withCredentials: true })
      .then((response) => {
        setRepositories(response.data.results.data);
        setTotal(response.data.results.total);
        setPage(response.data.page);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function removeUser(userId) {
    axios
      .delete(`${process.env.REACT_APP_API_URL || '/api/'}user/${userId}`)
      .then(() => {
        openNotificationWithIcon(
          "success",
          "Success",
          "User has been removed."
        );
        getResults(email, 1);
      })
      .catch(() => {
        openNotificationWithIcon(
          "error",
          "Error",
          "User could not be removed."
        );
      });
  }

  return (
    <>
      <Typography.Title level={3}>
        <UsergroupAddOutlined /> Users
      </Typography.Title>

      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          {
            title: "Home",
          },
          {
            title: "Users",
          },
        ]}
      />
      <Content style={{ backgroundColor: "white", padding: 20 }}>
        <Input.Search
          loading={loading}
          allowClear={true}
          placeholder="Search"
          onEmptied={() => {
            setEmail("");
          }}
          onSearch={(description) => {
            setEmail(description);
          }}
          style={{
            width: 250,
            marginBottom: 10,
          }}
        />

        <Table pagination={false} dataSource={repositories} columns={[
          {
            title: 'Username', dataIndex: 'email', key: 'email', width: '50%'
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
                      removeUser(record._id);
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
            pageSize={10}
            showSizeChanger={false}
            disabled={loading}
            onChange={(e) => {
              getResults(email, e);
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
        <AddUser
          onSuccess={() => {
            openNotificationWithIcon(
              "success",
              "Success",
              "User was successfuly created."
            );
            getResults(email, 1);
            setShowNew(false);
          }}
          onError={(error) => {
            openNotificationWithIcon(
              "success",
              "Success",
              JSON.stringify(error)
            );
            setShowNew(false);
          }}
          onCancel={() => setShowNew(false)}
        />
      ) : (
        <></>
      )}

      {showUpdate ? (
        <UpdateUser
          userId={showUpdate._id}
          email={showUpdate.email}
          admin={showUpdate.admin}
          onSuccess={() => {
            openNotificationWithIcon(
              "success",
              "Success",
              "User was successfuly updated."
            );
            getResults(email, 1);
            setShowUpdate(false);
          }}
          onError={(error) => {
            openNotificationWithIcon(
              "success",
              "Success",
              JSON.stringify(error)
            );
            setShowUpdate(false);
          }}
          onCancel={() => setShowUpdate(false)}
        />
      ) : (
        <></>
      )}
    </>
  );
}

export default Users;
