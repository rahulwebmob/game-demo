import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type CoinsProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { rotateY: 0 }, animate: { rotateY: [0, 180, 360], transition: { duration: 0.7, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: CoinsProps) {
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
      <motion.circle
        cx={8} cy={8} r={6}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.09 10.37A6 6 0 1 1 10.34 18"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7 6h1v4"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="m16.71 13.88.7.71-2.82 2.82"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function Coins(props: CoinsProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  Coins,
  Coins as CoinsIcon,
  type CoinsProps,
};
