import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Empty,
  Layout,
  List,
  Menu,
  Pagination,
  Row,
  Skeleton,
  Tooltip,
  Typography,
} from "antd";
import {
  LinkOutlined,
  ExclamationCircleOutlined,
  PushpinOutlined,
  BugOutlined,
  FileOutlined,
  SettingOutlined,
  FunctionOutlined,
} from "@ant-design/icons";
import axios from "axios";
import queryString from "query-string";
import { Link, useParams, useSearchParams } from "react-router-dom";

const { Content, Sider } = Layout;

const severity = {
  CRITICAL: (
    <span style={{ color: "red" }}>
      <ExclamationCircleOutlined /> Critical severity
    </span>
  ),
  HIGH: (
    <span style={{ color: "red" }}>
      <ExclamationCircleOutlined /> High severity
    </span>
  ),
  MEDIUM: (
    <span style={{ color: "orange" }}>
      <ExclamationCircleOutlined /> Medium severity
    </span>
  ),
  LOW: (
    <span style={{ color: "black" }}>
      <ExclamationCircleOutlined /> Low severity
    </span>
  ),
  NEGLIGIBLE: (
    <span style={{ color: "grey" }}>
      <ExclamationCircleOutlined /> Negligibile severity
    </span>
  ),
};

function Findings() {
  const [loading, setLoading] = useState(true);

  const [findings, setFindings] = useState([]);
  const [attributes, setAttributes] = useState({});
  const [page, setPage] = useState(null);
  const [total, setTotal] = useState({});

  const [providers, setProviders] = useState([]);
  const [severities, setSeverities] = useState([]);
  const [ruleIds, setRuleIds] = useState([]);
  const [files, setFiles] = useState([]);
  const params = useParams();

  const [selectedFinding, setSelectedFinding] = useState(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    getResults(providers, severities, ruleIds, files, 1);
  }, [providers, severities, ruleIds, files]);

  function getResults(providers, severities, ruleIds, files, page) {
    setLoading(true);
    let query = queryString.stringify({
      providers,
      severities,
      ruleIds,
      files,
      page: page,
    });

    axios
      .get(
        `/api/repository/branch/${params.branchId}?` +
          query,
        { withCredentials: true }
      )
      .then((response) => {
        setFindings(response.data.results.data);
        setTotal(response.data.results.total);
        setPage(response.data.page);
        setAttributes({
          files: response.data.attributes.files?.sort(),
          providers: response.data.attributes.providers?.sort(),
          ruleIds: response.data.attributes.ruleIds?.sort(),
          severities: response.data.attributes.severities?.sort(),
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function formatLongText(text) {
    if (!text || !text.length) {
      return null;
    }
    try {
      text = JSON.stringify(JSON.parse(text), null, 2);
      return (
        <Typography.Paragraph>
          <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
            {text}
          </pre>
        </Typography.Paragraph>
      );
    } catch (error) {
      return (
        <Typography.Paragraph style={{ textAlign: "justify" }}>
          {text}
        </Typography.Paragraph>
      );
    }
  }

  return (
    <Layout>
      <Typography.Title level={3}>
        <BugOutlined /> Findings
      </Typography.Title>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          {
            title: <Link to="/">Repositories</Link>,
          },
          {
            title: <Link to={`/repository/branch/?${queryString.stringify({ repository: searchParams.get('repository')})}`} >Branches</Link>,
          },
          {
            title: "Findings",
          },
        ]}
      />
      <Layout>
          <Sider>
            <Menu
              disabled={loading}
              mode="inline"
              defaultOpenKeys={["Providers"]}
              style={{
                height: "100%",
              }}
              selectedKeys={[...providers, ...ruleIds, ...files, ...severities]}
              onClick={(item) => {
                if (item.keyPath[1] === "Providers") {
                  let newState = [...providers];
                  if (!newState.includes(item.key)) {
                    newState.push(item.key);
                  } else {
                    newState.splice(newState.indexOf(item.key), 1);
                  }
                  setProviders(newState);
                  setSelectedFinding(null);
                }

                if (item.keyPath[1] === "Rules") {
                  let newState = [...ruleIds];
                  if (!newState.includes(item.key)) {
                    newState.push(item.key);
                  } else {
                    newState.splice(newState.indexOf(item.key), 1);
                  }
                  setSelectedFinding(null);
                  setRuleIds(newState);
                }

                if (item.keyPath[1] === "Severity") {
                  let newState = [...severities];
                  if (!newState.includes(item.key)) {
                    newState.push(item.key);
                  } else {
                    newState.splice(newState.indexOf(item.key), 1);
                  }
                  setSelectedFinding(null);
                  setSeverities(newState);
                }

                if (item.keyPath[1] === "Files") {
                  let newState = [...files];
                  if (!newState.includes(item.key)) {
                    newState.push(item.key);
                  } else {
                    newState.splice(newState.indexOf(item.key), 1);
                  }
                  setSelectedFinding(null);
                  setFiles(newState);
                }
              }}
              items={[
                {
                  key: "Providers",
                  label: "Providers",
                  icon: <SettingOutlined />,
                  children: attributes.providers?.map((provider) => {
                    return {
                      key: provider,
                      label: provider,
                    };
                  }),
                },
                {
                  key: "Rules",
                  label: "Rules",
                  icon: <BugOutlined />,
                  children: attributes.ruleIds?.map((ruleId) => {
                    return {
                      key: ruleId,
                      label: <Tooltip title={ruleId}><span>{ruleId}</span></Tooltip>,
                    };
                  }),
                },
                {
                  key: "Severity",
                  label: "Severity",
                  icon: <ExclamationCircleOutlined />,
                  children: attributes.severities?.map((severity) => {
                    return {
                      key: severity,
                      label: severity,
                    };
                  }),
                },
                {
                  key: "Files",
                  label: "Files",
                  icon: <FileOutlined />,
                  children: attributes.files?.map((file) => {
                    return {
                      key: file,
                      label: <Tooltip title={file}><span>{file}</span></Tooltip>,
                    };
                  }),
                },
              ]}
            />
          </Sider>

            <Content
              style={{
                backgroundColor: "white",
                padding: "5px 20px",
              }}
            >
              { loading ? <Skeleton active/> :
                !findings.length ? (
                  <Empty description="There are no findings for this reference" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  
                ) : (
                  <Row>
                    <Col
                      span={8}
                      style={{
                        borderRight: "1px solid rgba(5,5,5,.06)",
                        paddingRight: 15,
                      }}
                    >
                      <List
                        dataSource={findings}
                        renderItem={(finding) => (
                          <List.Item
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectedFinding(null);
                              setSelectedFinding(finding);
                              window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
                            }}
                          >
                            <List.Item.Meta
                              title={finding.title || `${finding.message?.substring(0, 100)}...`}
                              description={
                                <div>

                                  <div>
                                    {severity[finding.severity]}
                                    <span style={{ paddingLeft: 15 }}>
                                      <SettingOutlined /> Provider: {finding.provider}
                                    </span>
                                  </div>

                                  {finding.ruleId ? (
                                    <div>
                                      <span>
                                        <BugOutlined /> Rule: {finding.ruleId}
                                      </span>
                                    </div>
                                  ) : null}

                                  {finding.package ? (
                                    <div>
                                      <span>
                                        <PushpinOutlined /> Package: {finding.package}
                                      </span>
                                    </div>
                                  ) : null}

                                  </div>

                              }
                            />
                          </List.Item>
                        )}
                      />

                      <div
                        style={{
                          marginTop: 10,
                          borderTop: "1px solid rgba(5,5,5,.06)",
                          paddingTop: 15,
                        }}
                      >
                        <Pagination
                          total={total}
                          current={parseInt(page?.current) || 1}
                          pageSize={20}
                          showSizeChanger={false}
                          disabled={loading}
                          onChange={(e) => {
                            getResults(providers, severities, ruleIds, files, e);
                          }}
                        />
                      </div>
                    </Col>
                    <Col span={16} style={{ padding: "15px" }}>
                      {selectedFinding ? (
                        <>
                          <Typography.Title style={{ marginTop: 0 }} level={5}>
                            <BugOutlined /> {selectedFinding.title || `${selectedFinding.message?.substring(0, 100)}...`}
                          </Typography.Title>
                          <Divider />
                          <Descriptions
                            items={[
                              {
                                key: "severity",
                                label: (
                                  <span>
                                    <ExclamationCircleOutlined /> Severity
                                  </span>
                                ),
                                children: (
                                  <span
                                    className={`severity ${selectedFinding.severity}`}
                                  >
                                    {selectedFinding.severity}
                                  </span>
                                ),
                              },
                              {
                                key: "provider",
                                label: (
                                  <span>
                                    <SettingOutlined /> Provider
                                  </span>
                                ),
                                children: selectedFinding.provider,
                              },
                              {
                                key: "cve",
                                label: (
                                  <span>
                                    <SettingOutlined /> CVE
                                  </span>
                                ),
                                children: selectedFinding.cve,
                              },
                              {
                                key: "ruleId",
                                label: (
                                  <span>
                                    <SettingOutlined /> Rule
                                  </span>
                                ),
                                children: selectedFinding.ruleId,
                                span: 3,
                              },
                              {
                                key: "file",
                                label: (
                                  <span>
                                    <FileOutlined /> File
                                  </span>
                                ),
                                children: `${selectedFinding.file}${
                                  selectedFinding.line?.length ? ':' + selectedFinding.line : ''
                                }`,
                                span: 3,
                              },
                              {
                                key: "resource",
                                label: (
                                  <span>
                                    <FunctionOutlined /> Resource
                                  </span>
                                ),
                                children: selectedFinding.resource,
                              },
                              {
                                key: "package",
                                label: (
                                  <span>
                                    <PushpinOutlined /> Package
                                  </span>
                                ),
                                children: selectedFinding.package,
                                span: 2,
                              },
                              {
                                key: "version",
                                label: (
                                  <span>
                                    <PushpinOutlined /> Version
                                  </span>
                                ),
                                children: selectedFinding.version,
                                span: 1,
                              },
                              {
                                key: "url",
                                label: (
                                  <span>
                                    <LinkOutlined /> URL
                                  </span>
                                ),
                                children: selectedFinding.url?.length ? (
                                  selectedFinding.url.map(url => {
                                    return <div style={{ display: 'block' }}><a
                                      href={url}
                                      rel="noreferrer"
                                      target="_blank"
                                    >
                                      {url}
                                    </a></div>
                                  })
                                ) : null,
                                span: 3,
                              },
                            ].filter((item) => item.children)}
                          />
                          <Divider />

                          <Typography.Title level={5}>Details</Typography.Title>
                          <Typography.Paragraph>{selectedFinding.message}</Typography.Paragraph>
                          <Typography.Paragraph>{selectedFinding.impact}</Typography.Paragraph>

                          {!selectedFinding.resolutiom ? null : (
                            <>
                              <Divider />
                              <Typography.Title level={5}>
                                Resolution
                              </Typography.Title>
                              {formatLongText(selectedFinding.resolutiom)}
                            </>
                          )}
                          <Collapse items={[
                            { key: 'raw', label: 'Full scan result', children: formatLongText(selectedFinding.details)  }
                          ]} />
                        </>
                      ) : (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="No finding has been selected"
                        />
                      )}
                    </Col>
                  </Row>
                )}
            </Content>
      </Layout>
    </Layout>
  );
}

export default Findings;
