import { CampaignType } from '@types/campaign';

export const CATEGORY_MAP = {
  2: "other",
  3: "PAGE_VIEW",
  4: "PURCHASE",
  5: "SUBSCRIBE_PAID",
  6: "SIGNUP",
};

export const ORIGIN_MAP = {
  2: "WEBSITE",
};

export const CAMPAIGN_TEMPLATE = [
  {
    name: "三刀流",
    allowCampaignType: [
      CampaignType.DC,
      CampaignType.DG,
      CampaignType.DS,
      CampaignType.PM,
    ],
    template: [[0], [0], [0]],
  },
  {
    name: "后置三刀流",
    allowCampaignType: [
      CampaignType.DC,
      CampaignType.DG,
      CampaignType.DS,
      CampaignType.PM,
    ],
    template: [[0], [1], [2]],
  },
  {
    name: "battle流",
    allowCampaignType: [
      CampaignType.DC,
      CampaignType.DG,
      CampaignType.DS,
      CampaignType.PM,
    ],
    template: [[0], [1]],
  },
  {
    name: "一刀流",
    allowCampaignType: [
      CampaignType.DC,
      CampaignType.DG,
      CampaignType.DS,
      CampaignType.PM,
    ],
    template: [[0]],
  },
];
