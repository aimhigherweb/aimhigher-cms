import type { Schema, Struct } from '@strapi/strapi';

export interface BrandColours extends Struct.ComponentSchema {
  collectionName: 'components_brand_colours';
  info: {
    displayName: 'Colours';
    icon: 'brush';
  };
  attributes: {
    hex: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#'>;
    name: Schema.Attribute.String;
  };
}

export interface BrandFonts extends Struct.ComponentSchema {
  collectionName: 'components_brand_fonts';
  info: {
    displayName: 'Fonts';
    icon: 'italic';
  };
  attributes: {
    body: Schema.Attribute.String;
    code: Schema.Attribute.String;
    heading: Schema.Attribute.String;
  };
}

export interface CaseStudyScreenshots extends Struct.ComponentSchema {
  collectionName: 'components_case_study_screenshots';
  info: {
    displayName: 'Screenshots';
    icon: 'landscape';
  };
  attributes: {
    laptop: Schema.Attribute.Media<'images'>;
    mobile: Schema.Attribute.Media<'images'>;
    tablet: Schema.Attribute.Media<'images'>;
  };
}

export interface MetaMeta extends Struct.ComponentSchema {
  collectionName: 'components_meta_metas';
  info: {
    displayName: 'meta';
    icon: 'hashtag';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface PortalPortalPermissions extends Struct.ComponentSchema {
  collectionName: 'components_portal_portal_permissions';
  info: {
    displayName: 'Portal Permissions';
    icon: 'lock';
  };
  attributes: {
    sections: Schema.Attribute.Relation<
      'oneToMany',
      'api::portal-section.portal-section'
    >;
  };
}

export interface ProjectActionItems extends Struct.ComponentSchema {
  collectionName: 'components_project_action_items';
  info: {
    displayName: 'Action Items';
    icon: 'check';
  };
  attributes: {
    description: Schema.Attribute.RichText;
    due: Schema.Attribute.Date;
    name: Schema.Attribute.String;
    type: Schema.Attribute.Enumeration<
      ['finance', 'content', 'design', 'development']
    >;
  };
}

export interface ProjectApproval extends Struct.ComponentSchema {
  collectionName: 'components_project_approvals';
  info: {
    displayName: 'approval';
    icon: 'user';
  };
  attributes: {
    approved: Schema.Attribute.Boolean;
    company: Schema.Attribute.String;
    date: Schema.Attribute.DateTime;
    email: Schema.Attribute.Email;
    name: Schema.Attribute.String;
  };
}

export interface ProjectTask extends Struct.ComponentSchema {
  collectionName: 'components_project_tasks';
  info: {
    displayName: 'task';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.RichText;
    end: Schema.Attribute.Date;
    name: Schema.Attribute.String;
    start: Schema.Attribute.Date;
    status: Schema.Attribute.Enumeration<
      ['notStarted', 'inProgress', 'blocked', 'inReview', 'completed']
    >;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'brand.colours': BrandColours;
      'brand.fonts': BrandFonts;
      'case-study.screenshots': CaseStudyScreenshots;
      'meta.meta': MetaMeta;
      'portal.portal-permissions': PortalPortalPermissions;
      'project.action-items': ProjectActionItems;
      'project.approval': ProjectApproval;
      'project.task': ProjectTask;
    }
  }
}
