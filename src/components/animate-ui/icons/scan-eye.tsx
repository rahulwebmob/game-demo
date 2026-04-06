import { motion, type Variants } from "framer-motion";

import {
  getVariants,
  useAnimateIconContext,
  IconWrapper,
  type IconProps,
} from "@/components/animate-ui/icons/icon.tsx";

type ScanEyeProps = IconProps<keyof typeof animations>;

const animations = {
  default: {
    group: { initial: { scale: 1 }, animate: { scale: [1, 1.05, 0.95, 1], transition: { duration: 0.5, ease: 'easeInOut' } } },
  } satisfies Record<string, Variants>,
} as const;

function IconComponent({ size, ...props }: ScanEyeProps) {
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
        d="M3 7V5a2 2 0 0 1 2-2h2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M17 3h2a2 2 0 0 1 2 2v2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M21 17v2a2 2 0 0 1-2 2h-2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M7 21H5a2 2 0 0 1-2-2v-2"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.circle
        cx={12} cy={12} r={1}
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
      <motion.path
        d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0"
        variants={variants.group}
        initial="initial"
        animate={controls}
      />
    </motion.svg>
  );
}

function ScanEye(props: ScanEyeProps) {
  return <IconWrapper icon={IconComponent} {...props} />;
}

export {
  ScanEye,
  ScanEye as ScanEyeIcon,
  type ScanEyeProps,
};
