
interface Props {
    params: {
        workspaceId: string
    }
}

const WorkspaceIdPage = ({ params }:Props) => {
    return (
        <div>
            WorkspaceId: {params.workspaceId}
        </div>
    );
};

export default WorkspaceIdPage;