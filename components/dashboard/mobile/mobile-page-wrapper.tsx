import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function MobilePageWrapper({
  children,
}: Props) {
  return (
    <div className="pb-20 lg:pb-0">
      {children}
    </div>
  );
}