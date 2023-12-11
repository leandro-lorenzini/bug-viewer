
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card, Col, Typography } from "antd";
import { useEffect, useState } from "react";
import { LineChartOutlined } from "@ant-design/icons";

Chart.register(CategoryScale);

function Stats(props) {

    const [scans, setScans] = useState();

    useEffect(() => {
        setScans(
            {
              labels: props.scans.map((data) => {
                let date = new Date(data.updatedAt);
                return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
              }), 
              datasets: [
                {
                  label: "Critical",
                  data: props.scans.map((data) => data.critical),
                  backgroundColor: '#750000'
                },
                {
                  label: "High",
                  data: props.scans.map((data) => data.high),
                  backgroundColor: '#F00000'
                },
                {
                  label: "Medium",
                  data: props.scans.map((data) => data.medium),
                  backgroundColor: '#FFA500'
                },
                {
                  label: "Low",
                  data: props.scans.map((data) => data.low),
                  backgroundColor: '#9ACEEB'
                }
              ]
            }
  
          );
    }, [])

    return (
        <>
            <Col span={12}>
                <Card>
                    <Typography.Title style={{ marginTop: 0 }} level={5}>
                        <LineChartOutlined /> Evolution
                    </Typography.Title>
                    { !scans ? <>-</> : <Bar data={scans}/> }
                </Card>
            </Col>
        </>
    );
       
}

export default Stats;