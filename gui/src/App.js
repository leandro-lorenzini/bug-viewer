import React, { useEffect, useState } from "react";
import { Layout, ConfigProvider, Menu, notification } from "antd";
import Repositories from "./views/Repositories";
import Branches from "./views/Branches";
import Findings from "./views/Findings";
import { Route, Routes, Navigate, Link, useLocation } from "react-router-dom";
import Signin from "./views/signin";
import axios from "axios";
import {
  BugOutlined,
  BranchesOutlined,
  KeyOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
  UserOutlined,
  RetweetOutlined,
} from "@ant-design/icons";
import { Content } from "antd/es/layout/layout";
import Tokens from "./views/tokens/Tokens";
import AuthenticationSettings from "./views/AuthenticationSettings";
import Users from "./views/users/Users";
import ChangePassword from "./views/ChangePassword";
import Parser from "./views/parsers/Parsers";
import Repository from "./views/Repository";

function App() {
  const { Sider, Footer } = Layout;
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);

  const [version, setVersion] = useState("");

  const [showChangePassword, setShowChangePassword] = useState(false);

  const [api, contextHolder] = notification.useNotification();
  const openNotificationWithIcon = (type, message, description) => {
    api[type]({
      message: message,
      description,
    });
  };

  const location = useLocation();

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL || '/api/'}auth`)
      .then((response) => {
        if (response.data && response.data.userId) {
          setUser({
            userId: response.data.userId,
            admin: response.data.admin,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });

      axios
      .get(`${process.env.REACT_APP_API_URL || '/api/'}settings/version`)
      .then((response) => {
        setVersion(response.data);
      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

  if (loading) {
    return <></>;
  }

  if (!user) {
    return <Signin setUser={setUser} />;
  }

  return (
    <ConfigProvider>
      <Layout style={{ height: "100%" }} hasSider>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={() => setCollapsed(!collapsed)}
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div
            style={{
              color: "white",
              fontSize: 20,
              textAlign: "center",
              padding: 20,
            }}
          >
            <BugOutlined />
            <span
              style={{ marginLeft: 5, display: collapsed ? "none" : "inline" }}
            >
              BugViewer
            </span>
          </div>
          <Menu
            style={{ height: "100%" }}
            theme="dark"
            mode="inline"
            defaultOpenKeys={[location.pathname.split("/")[1]]}
            selectedKeys={[
              location.pathname.split("/")[1],
              location.pathname.split("/")[2],
            ]}
            defaultSelectedKeys={["Repositories"]}
            items={[
              {
                key: "repository",
                label: <Link to="/repositories">Repositories</Link>,
                icon: <BranchesOutlined />,
              },
              {
                key: "token",
                label: <Link to="/token">Tokens</Link>,
                icon: <KeyOutlined />,
              },
              {
                key: "parser",
                label: <Link to="/parser">Parsers</Link>,
                icon: <RetweetOutlined />,
                admin: true,
              },
              {
                key: "user",
                label: <Link to="/user">Users</Link>,
                icon: <UsergroupAddOutlined />,
                admin: true,
              },
              {
                key: "settings",
                label: "Settings",
                icon: <SettingOutlined />,
                children: [
                  {
                    key: "authentication",
                    label: (
                      <Link to="/settings/authentication">Authentication</Link>
                    ),
                  },
                ],
                admin: true,
              },
              {
                key: "account",
                label: "My account",
                icon: <UserOutlined />,
                children: [
                  {
                    key: "logout",
                    label: <a href={`${process.env.REACT_APP_API_URL || '/api/'}auth/signout`}>Sign out</a>,
                  },
                  {
                    key: "change-password",
                    label: (
                      <span onClick={() => setShowChangePassword(true)}>
                        Change password
                      </span>
                    ),
                  },
                ],
              },
            ].filter((i) => user.admin || !i.admin)}
          />
        </Sider>
        <Layout style={{ height: "100%", marginLeft: !collapsed ? 200 : 90 }}>
          <Content style={{ paddingRight: 10, paddingLeft: 10 }}>
            <Routes>
              <Route
                key={"repositories"}
                path="/repositories"
                element={<Repositories />}
              />
              <Route
                key={"repository"}
                path="/repository/:repositoryId"
                element={<Repository />}
              />
              <Route
                path="/repository/branch"
                element={<Branches />}
              />
              <Route
                path="/repository/branch/:branchId"
                element={<Findings />}
              />

              <Route path="/token" element={<Tokens />} />
              <Route path="/parser" element={<Parser />} />
              <Route path="/user" element={<Users />} />
              <Route
                path="/settings/authentication"
                element={<AuthenticationSettings />}
              />

              <Route path="*" element={<Navigate to="/repository" />} />
            </Routes>
          </Content>
          <Footer style={{ textAlign: 'center', color: '#7f7b7b' }}>
            <a href="https://github.com/leandro-lorenzini/bug-viewer" target="_blank">BugViewer</a><br />
            API: v{version} | GUI: v{process.env.REACT_APP_VERSION}
          </Footer>
        </Layout>
      </Layout>
      {contextHolder}
      {showChangePassword ? (
        <ChangePassword
          onSuccess={() => {
            openNotificationWithIcon(
              "success",
              "Success",
              "Password has been changed."
            );
            setShowChangePassword(false);
          }}
          onError={() => {
            openNotificationWithIcon(
              "error",
              "Error",
              "Password could not be changed."
            );
            setShowChangePassword(false);
          }}
          onCancel={() => {
            setShowChangePassword(false);
          }}
        />
      ) : null}
    </ConfigProvider>
  );
}
export default App;
