interface BadgeProps {
  children: React.ReactNode;
  color?: "blue" | "orange" | "purple" | "green" | "red";
  className?: string;
}

const AccountBadge: React.FC<BadgeProps> = ({
  children,
  color = "blue",
  className,
}) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-md capitalize font-medium ${colors[color]} ${className}`}
    >
      {children}
    </span>
  );
};

export default AccountBadge;
