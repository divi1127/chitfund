// Prizes page component
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { fmt } from "../utils/helpers";
import { useAuth } from "../contexts/AuthContext";

export function Prizes() {
  const { user } = useAuth();
  const { data: auctions, loading } = useData('/auctions');
  const { data: members } = useData('/members');
  const { data: groups } = useData('/groups');

  const isUser = user?.role === 'user';
  const userMember = isUser ? members.find(m => m.memberId === user.userId || m.email === user.email) : null;
  const userGroupIds = userMember?.groups || [];

  const completedAuctions = auctions
    .filter(a => a.status === "Completed")
    .filter(a => !isUser || userGroupIds.includes(a.groupId));

  const groupById = id => groups.find(g => g.id === id);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Prize Payments"
        subtitle={isUser ? "Your group's prize payout history" : "Track auction prize payouts"} />

      <Table cols={["Auction ID", "Group", "Winning Bid", "Prize Amount", "Status"]}
        rows={completedAuctions.map(a => [
          a.id,
          groupById(a.groupId)?.name || "—",
          fmt(a.winningBid || 0),
          fmt(a.baseAmount - (a.winningBid || 0)),
          <Badge key={a.id} text="Paid" color="green" />
        ])} />
    </div>
  );
}
