import { useData } from "../hooks/useData";
import { SectionHeader } from "../components/SectionHeader";
import { Table } from "../components/Table";
import { fmt } from "../utils/helpers";

export function Reports() {
  const { data: collections, loading: collectionsLoading } = useData('/collections');
  const { data: members, loading: membersLoading } = useData('/members');
  const { data: groups, loading: groupsLoading } = useData('/groups');

  if (collectionsLoading || membersLoading || groupsLoading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div>
      <SectionHeader title="Reports" subtitle="Generate and view reports" />
      
      <div style={{ display: "grid", gap: 24 }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Collection Summary</h3>
          <Table cols={["Total Collections", "Total Amount", "Average per Collection"]}
            rows={[
              [collections.length, fmt(collections.reduce((sum, c) => sum + (c.amount || 0), 0)), fmt(collections.length > 0 ? collections.reduce((sum, c) => sum + (c.amount || 0), 0) / collections.length : 0)]
            ]}
          />
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Member Summary</h3>
          <Table cols={["Total Members", "Active Members", "Inactive Members"]}
            rows={[
              [members.length, members.filter(m => m.status === "Active").length, members.filter(m => m.status !== "Active").length]
            ]}
          />
        </div>

        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>Group Summary</h3>
          <Table cols={["Total Groups", "Active Groups", "Total Members in Groups"]}
            rows={[
              [groups.length, groups.filter(g => g.status === "Active").length, groups.reduce((sum, g) => sum + (g.members?.length || 0), 0)]
            ]}
          />
        </div>
      </div>
    </div>
  );
}
