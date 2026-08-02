import { Suspense } from "react";

import { AdminAcceptInviteContent } from "@/features/admin/components/admin-accept-invite-content";

export default function AdminAcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AdminAcceptInviteContent />
    </Suspense>
  );
}
