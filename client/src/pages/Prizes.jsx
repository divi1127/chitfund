// Prizes page component
import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { Badge } from "../components/Badge";
import { fmt } from "../utils/helpers";

export function Prizes() {
  const { data: auctions, loading } = useData('/auctions');
  
  const completedAuctions = auctions.filter(a => a.status === "Completed");

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Prize Payments" subtitle="Track auction prize payouts" />
      
      <Table cols={["Auction ID", "Winning Bid", "Prize Amount", "Status"]}
        rows={completedAuctions.map(a => [
          a.id,
          fmt(a.winningBid || 0),
          fmt(a.baseAmount - (a.winningBid || 0)),
          <Badge key={a.id} text="Paid" color="green" />
        ])} />
    </div>
  );
}
