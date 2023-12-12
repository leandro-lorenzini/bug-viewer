import { Select, Skeleton, Tabs, Typography } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BranchesOutlined } from "@ant-design/icons";
import Findings from "./Findings";
import Summary from "./Summary";

function Branch() {
  const [loading, setLoading] = useState(true);
  const [repository, setRepository] = useState(true);
  const { repositoryId, branchId } = useParams();
  const [branch, setBranch] = useState();
  const [parsers, setParsers] = useState([]);
  const navigate = useNavigate();


  function getRepository() {
    axios
      .get(
        `${process.env.REACT_APP_API_URL || "/api/"}repository/${repositoryId}`,
        { withCredentials: true }
      )
      .then((response) => {
        setRepository(response.data);

        if (!branchId) {
          response.data?.branches?.forEach((branch) => {
            if (
              branch.ref === response.data.head ||
              branch.ref === `refs/heads/${response.data.head}`
            ) {
              getBranch(branch._id);
            }
          });
        }
      });
  }

  function getParsers() {
    axios
      .get(`${process.env.REACT_APP_API_URL || "/api/"}parser?page=1`, {
        withCredentials: true,
      })
      .then((response) => {
        setParsers(response.data.results.data);
      });
  }

  function getBranch(branchId) {
    axios
      .get(
        `${
          process.env.REACT_APP_API_URL || "/api/"
        }repository/${repositoryId}/branch/${branchId}`,
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        setBranch(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    setLoading(true);
    getParsers();
    getRepository();
    if (branchId) {
      getBranch(branchId);
    }
  }, [branchId]);

  function changeBranch(branchId) {
    navigate(`/repository/${repository._id}/branch/${branchId}`)
  }

  return (
    <div>
      <Typography.Title level={3}>
        {!loading ? (
          <>
            <BranchesOutlined /> {repository?.name} -
            <Select 
              defaultValue={branch?.ref || "Protected branch"}
              bordered={false}
              className="branchName"
              style={{ fontSize: 30 }}
              options={repository?.branches?.map((branch) => {
                return { label: branch.ref, value: branch._id }
              })}
              onChange={changeBranch}
            />
          </>
        ) : (
          <Skeleton.Button size="small" style={{ width: 500 }} active />
        )}
      </Typography.Title>

      <Tabs
        items={[
          {
            key: "Summary",
            label: "Summary",
            children: (
              <Summary branch={branch} loading={loading} parsers={parsers} />
            ),
          },
          {
            key: "Vulnerabilities",
            label: "Vulnerabilities",
            children:
              branch && repository ? (
                <Findings branch={branch} repository={repository} />
              ) : (
                <></>
              ),
          },
        ]}
      />
    </div>
  );
}

export default Branch;
