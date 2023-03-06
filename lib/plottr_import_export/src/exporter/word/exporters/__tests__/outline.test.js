import { multi_tier_file } from './fixtures'
import exportOutline, { exportOutlineDirectives } from '../outline'
import { namesMapping } from '../../exporter'
import default_export_config from '../../../default_config'

describe('exportOutline', () => {
  describe('given a file with a timeline that three levels of structure', () => {
    it('should export a structure with appropriate heading levels', () => {
      const names = namesMapping(multi_tier_file)
      expect(
        JSON.parse(
          JSON.stringify(exportOutline(multi_tier_file, names, default_export_config.word))
        )
      ).toEqual([
        {
          children: [
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading1' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                    {
                      rootKey: 'w:jc',
                      root: [
                        { rootKey: '_attr', root: { val: 'center' }, xmlKeys: { val: 'w:val' } },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'Outline',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading1' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                  {
                    rootKey: 'w:jc',
                    root: [
                      { rootKey: '_attr', root: { val: 'center' }, xmlKeys: { val: 'w:val' } },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading2' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'Act 1',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading2' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading3' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'Intro (Main Plot)',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading3' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [
                { rootKey: 'w:pPr', root: [], numberingReferences: [] },
                {
                  rootKey: 'w:r',
                  root: [{ rootKey: 'w:rPr', root: [] }],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading3' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'Chapter 1',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading3' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading3' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'First memories (Main Plot)',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading3' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [
                { rootKey: 'w:pPr', root: [], numberingReferences: [] },
                {
                  rootKey: 'w:r',
                  root: [{ rootKey: 'w:rPr', root: [] }],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading3' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'Leaving the plateau (Memories)',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading3' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [
                { rootKey: 'w:pPr', root: [], numberingReferences: [] },
                {
                  rootKey: 'w:r',
                  root: [{ rootKey: 'w:rPr', root: [] }],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading4' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'Scene 1',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading4' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading3' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'shadows (Memories)',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading3' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [
                { rootKey: 'w:pPr', root: [], numberingReferences: [] },
                {
                  rootKey: 'w:r',
                  root: [{ rootKey: 'w:rPr', root: [] }],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading2' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'Act 2',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading2' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading3' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        "Zora's Domain (Main Plot)",
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading3' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [
                { rootKey: 'w:pPr', root: [], numberingReferences: [] },
                {
                  rootKey: 'w:r',
                  root: [{ rootKey: 'w:rPr', root: [] }],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading3' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'Chapter 2',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading3' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading3' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'Preparation (Main Plot)',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading3' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [
                { rootKey: 'w:pPr', root: [], numberingReferences: [] },
                {
                  rootKey: 'w:r',
                  root: [{ rootKey: 'w:rPr', root: [] }],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading3' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'Prince Sidon (Memories)',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading3' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [
                { rootKey: 'w:pPr', root: [], numberingReferences: [] },
                {
                  rootKey: 'w:r',
                  root: [{ rootKey: 'w:rPr', root: [] }],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading4' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'Scene 2',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading4' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [{ rootKey: 'w:pPr', root: [], numberingReferences: [] }],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
            {
              rootKey: 'w:p',
              root: [
                {
                  rootKey: 'w:pPr',
                  root: [
                    {
                      rootKey: 'w:pStyle',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { val: 'Heading3' },
                          xmlKeys: {
                            val: 'w:val',
                            color: 'w:color',
                            fill: 'w:fill',
                            space: 'w:space',
                            sz: 'w:sz',
                            type: 'w:type',
                            rsidR: 'w:rsidR',
                            rsidRPr: 'w:rsidRPr',
                            rsidSect: 'w:rsidSect',
                            w: 'w:w',
                            h: 'w:h',
                            top: 'w:top',
                            right: 'w:right',
                            bottom: 'w:bottom',
                            left: 'w:left',
                            header: 'w:header',
                            footer: 'w:footer',
                            gutter: 'w:gutter',
                            linePitch: 'w:linePitch',
                            pos: 'w:pos',
                          },
                        },
                      ],
                    },
                  ],
                  numberingReferences: [],
                },
                {
                  rootKey: 'w:r',
                  root: [
                    { rootKey: 'w:rPr', root: [] },
                    {
                      rootKey: 'w:t',
                      root: [
                        {
                          rootKey: '_attr',
                          root: { space: 'preserve' },
                          xmlKeys: { space: 'xml:space' },
                        },
                        'Vah Ruta (Main Plot)',
                      ],
                    },
                  ],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: {
                rootKey: 'w:pPr',
                root: [
                  {
                    rootKey: 'w:pStyle',
                    root: [
                      {
                        rootKey: '_attr',
                        root: { val: 'Heading3' },
                        xmlKeys: {
                          val: 'w:val',
                          color: 'w:color',
                          fill: 'w:fill',
                          space: 'w:space',
                          sz: 'w:sz',
                          type: 'w:type',
                          rsidR: 'w:rsidR',
                          rsidRPr: 'w:rsidRPr',
                          rsidSect: 'w:rsidSect',
                          w: 'w:w',
                          h: 'w:h',
                          top: 'w:top',
                          right: 'w:right',
                          bottom: 'w:bottom',
                          left: 'w:left',
                          header: 'w:header',
                          footer: 'w:footer',
                          gutter: 'w:gutter',
                          linePitch: 'w:linePitch',
                          pos: 'w:pos',
                        },
                      },
                    ],
                  },
                ],
                numberingReferences: [],
              },
            },
            {
              rootKey: 'w:p',
              root: [
                { rootKey: 'w:pPr', root: [], numberingReferences: [] },
                {
                  rootKey: 'w:r',
                  root: [{ rootKey: 'w:rPr', root: [] }],
                  properties: { rootKey: 'w:rPr', root: [] },
                },
              ],
              properties: { rootKey: 'w:pPr', root: [], numberingReferences: [] },
            },
          ],
        },
      ])
    })
  })
})

describe('exportOutlineDirectives', () => {
  describe('given the multi tier file', () => {
    it('should export headings at the correct levels', () => {
      const names = namesMapping(multi_tier_file)
      const result = exportOutlineDirectives(multi_tier_file, names, default_export_config.word)
      expect(result).toEqual(expect.arrayContaining([
        { type: 'paragraph', text: 'Outline', heading: 'Heading1', alignment: 'center' },
        { type: 'paragraph', text: 'Act 1', heading: 'Heading2' },
        { type: 'paragraph', text: 'Intro (Main Plot)', heading: 'Heading3' },
        { type: 'paragraph', text: 'Chapter 1', heading: 'Heading3' },
        { type: 'paragraph', text: 'First memories (Main Plot)', heading: 'Heading3' },
        { type: 'paragraph', text: 'Leaving the plateau (Memories)', heading: 'Heading3' },
        { type: 'paragraph', text: 'Scene 1', heading: 'Heading4' },
        { type: 'paragraph', text: 'shadows (Memories)', heading: 'Heading3' },
        { type: 'paragraph', text: 'Act 2', heading: 'Heading2' },
        { type: 'paragraph', text: "Zora's Domain (Main Plot)", heading: 'Heading3' },
        { type: 'paragraph', text: 'Chapter 2', heading: 'Heading3' },
        { type: 'paragraph', text: 'Preparation (Main Plot)', heading: 'Heading3' },
        { type: 'paragraph', text: 'Prince Sidon (Memories)', heading: 'Heading3' },
        { type: 'paragraph', text: 'Scene 2', heading: 'Heading4' },
        { type: 'paragraph', text: 'Vah Ruta (Main Plot)', heading: 'Heading3' },
      ]))
    })
  })
})
