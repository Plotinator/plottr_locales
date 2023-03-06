import { multi_tier_file } from './fixtures'
import exportOutline from '../outline'
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

// describe('exportOutlineDirectives', () => {
  
// })
