import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type LogOutProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { x: 0 }, animate: { x: [0, 3, 0], transition: { duration: 0.5, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: LogOutProps) {
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
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.polyline
        points="16 17 21 12 16 7"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.line
        x1={21} x2={9} y1={12} y2={12}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function LogOut(props: LogOutProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  LogOut,
  LogOut as LogOutIcon,
  type LogOutProps,
};
