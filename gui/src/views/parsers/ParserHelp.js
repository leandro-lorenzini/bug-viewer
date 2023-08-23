import { Typography } from "antd";

function ParserHelp() {
    return (<>
        <Typography.Title style={{ marginTop: 0 }} level={5}>Example</Typography.Title>
        The following JSON structure will be used as an example of a result source.
        <Typography.Paragraph code>
            {"{"} results: {"["} {"{"} error: {"{"} name: "Error name" {"}"} {"}"} {"]"} {"}"}
        </Typography.Paragraph>
        <Typography.Paragraph>
            For the given example, the JSON root path will be
            <Typography.Paragraph code> results</Typography.Paragraph>
        </Typography.Paragraph>

        <Typography.Paragraph>
            Under the fields mapping, inform what is the JSON path for the corresponding field.
            Eg. Title could be <Typography.Paragraph code> error.name</Typography.Paragraph>
        </Typography.Paragraph>

        <Typography.Paragraph>
            Under the severity mapping, inform what is the corresponding value in the source file.
            Eg: High: Serious, Low: 'Not so serious'... Sometimes you'll need to check the provider's documentation
            to know what are the corresponding values.
        </Typography.Paragraph>
    </>)
}

export default ParserHelp;