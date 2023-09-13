import React, { useEffect, useState } from "react";
import {
  Breadcrumb,
  Col,
  Tabs,
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
  Typography
} from "antd";
import {
  LinkOutlined,
  ExclamationCircleOutlined,
  PushpinOutlined,
  BugOutlined,
  FileOutlined,
  SettingOutlined,
  FunctionOutlined,
  ReadOutlined,
  ThunderboltOutlined,
  ExceptionOutlined
} from "@ant-design/icons";
import axios from "axios";
import queryString from "query-string";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Stats from "./Stats";


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

  const [scans, setScans] = useState();

  const [providers, setProviders] = useState([]);
  const [severities, setSeverities] = useState([]);
  const [ruleIds, setRuleIds] = useState([]);
  const [files, setFiles] = useState([]);
  const params = useParams();

  const [selectedFinding, setSelectedFinding] = useState(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    getResults(providers, severities, ruleIds, files, 1);

    axios.get(`/api/repository/${searchParams.get('repository')}/branch/${params.branchId}`)
      .then(response => {
        setScans(
          {
            labels: response.data.map((data) => new Date(data.updatedAt).toDateString()), 
            datasets: [
              {
                label: "Critical",
                data: response.data.map((data) => data.critical),
                backgroundColor: '#750000'
              },
              {
                label: "High",
                data: response.data.map((data) => data.high),
                backgroundColor: '#F00000'
              },
              {
                label: "Medium",
                data: response.data.map((data) => data.medium),
                backgroundColor: '#FFA500'
              },
              {
                label: "Low",
                data: response.data.map((data) => data.low),
                backgroundColor: '#9ACEEB'
              }
            ]
          }

        );
      })
      .catch(error => {
        console.log(error);
      })

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

  const list = <Layout>
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
        padding: "1px",
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
                
              }}
            >
              <List
                dataSource={findings}
                renderItem={(finding) => (
                  <List.Item
                    style={{ 
                      cursor: "pointer", 
                      paddingRight: 15, 
                      paddingLeft: 15, 
                      backgroundColor: selectedFinding?._id === finding._id ? '#f5f5f5':'#ffffff' }}
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
                              <span style={{ wordWrap: 'break-word' }}>
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
                  marginBottom: 15,
                  borderTop: "1px solid rgba(5,5,5,.06)",
                  paddingTop: 15,
                  textAlign: "center"
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
                  <Tabs items={[
                    {
                      key: '1',
                      label: 'Summary',
                      children: <>
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
                                <span>
                                  {selectedFinding.severity.toLowerCase()}
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
                          ].filter((item) => item.children)}
                        />
                         <Divider/>
                         <Descriptions
                          items={[
                            {
                              key: 'message',
                              label: <span><ReadOutlined /> Message</span>,
                              span: 3,
                              children: selectedFinding.message
                            },
                            {
                              key: 'impact',
                              label: <span><ExceptionOutlined /> Impact</span>,
                              span: 3,
                              children: selectedFinding.impact
                            },
                            {
                              key: 'resolution',
                              label: <span><ThunderboltOutlined /> Resolution</span>,
                              span: 3,
                              children: selectedFinding.resolution
                            },
                            {
                              key: "url",
                              label: (
                                <span>
                                  <LinkOutlined /> Reference
                                </span>
                              ),
                              children: selectedFinding.url?.length ? (
                                selectedFinding.url.map(url => {
                                  return <a
                                    href={url}
                                    rel="noreferrer"
                                    target="_blank"
                                  >
                                    {url}
                                  </a>
                                })[0]
                              ) : null,
                              span: 3,
                            },
                          ].filter((item) => item.children)}
                        />
                      </>
                    },
                    {
                      key: '2',
                      label: 'Details',
                      children: formatLongText(selectedFinding.details)
                      
                    }
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

  return (
    <Layout>
      <Typography.Title level={3}>
        <BugOutlined /> Findings - {searchParams.get('ref')}
      </Typography.Title>
      <Breadcrumb
        style={{ marginBottom: 10 }}
        items={[
          {
            title: <Link to="/">Repositories</Link>,
          },
          {
            title: <Link to={`/repository/branch/?${queryString.stringify({ 
              repository: searchParams.get('repository'),
              repositoryName: searchParams.get('repositoryName')
            })}`} >{searchParams.get('repositoryName')}</Link>,
          },
          {
            title: "Findings",
          },
        ]}
      />
      <Layout>
        <Content style={{ backgroundColor: "white", padding: 10 }}>
          <Tabs items={[
            { 
              key: 'findings',
              label: 'Findings',
              children: list
            },
            {
              key: 'stats',
              label: 'Overview',
              children: <Stats scans={scans} />
            }
          ]}/>
        </Content>
      </Layout>
      
    </Layout>
  );
}

export default Findings;
