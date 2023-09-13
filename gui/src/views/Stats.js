
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { Bar } from "react-chartjs-2";
import { Col, Row } from "antd";

Chart.register(CategoryScale);

function Stats(props) {
    return <Row>
        <Col span={12}>
            <h3>Historical number of findings</h3>
            { !props.scans ? <>-</> : <Bar data={props.scans}/> }
        </Col>
        <Col span={12}>
            
        </Col>
    </Row>
}

export default Stats;