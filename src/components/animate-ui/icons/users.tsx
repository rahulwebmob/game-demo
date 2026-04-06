import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type UsersProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scale: 1 }, animate: { scale: [1, 1.05, 1], transition: { duration: 0.4, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: UsersProps) {
  const { controls } = useAnimateIconContext();
  const variants = getVariants(animations);

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={variants.group}
      initial="initial"
      animate={controls}
      {...props}
    >
      <motion.path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={9} cy={7} r={4}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M22 21v-2a4 4 0 0 0-3-3.87"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M16 3.13a4 4 0 0 1 0 7.75"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Users(props: UsersProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Users,
  Users as UsersIcon,
  type UsersProps,
};
