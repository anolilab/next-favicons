import { wrap } from "jest-snapshot-serializer-raw"
import manifestGenerator from "../../src/generator/manifest-generator"
import fingerprint from "../../src/utils/fingerprint"
import { relative } from "../../src/utils/path"
import { icons as recommendedIcons } from "../../src/preset/recommended"
import { InternalOptions } from "../../src/types"
import NullLogger from "../../src/logger/null-logger"

const manifest = {
    name: "test",
    short_name: "__tests__-2",
    description: "description",
    start_url: "./",
    lang: "de-DE",
    display: "browser",
    dir: "auto",
    background_color: "#fff",
    theme_color: "#fff",
    orientation: "any",
    prefer_related_applications: true,
    related_applications: [
        {
            platform: "play",
            url: "https://play.google.com/store/apps/details?id=com.example.app1",
            id: "com.example.app1",
        },
        {
            platform: "itunes",
            url: "https://itunes.apple.com/app/example-app1/id123456789",
        },
    ],
    scope: "/app/",
    categories: ["books", "education", "medical"],
    iarc_rating_id: "e84b072d-71b3-4d3e-86ae-31a8ce4e53b7",
    screenshots: [
        {
            src: "screenshot1.webp",
            sizes: "1280x720",
            type: "image/webp",
        },
        {
            src: "screenshot2.webp",
            sizes: "1280x720",
            type: "image/webp",
        },
    ],
    shortcuts: [
        {
            name: "Today's agenda",
            url: "/today",
            description: "List of events planned for today",
        },
        {
            name: "New event",
            url: "/create/event",
        },
        {
            name: "New reminder",
            url: "/create/reminder",
        },
    ],
}

describe("manifest-generator", () => {
    it("generate full Manifest file", () => {
        expect.assertions(2)

        const output = manifestGenerator(
            {
                manifest,
                icons: recommendedIcons,
            } as InternalOptions,
            (path) => relative(path, "/", true),
            NullLogger
        )

        const data = output[0]

        expect(data.name).toStrictEqual("manifest.webmanifest")
        expect(wrap(data.contents)).toMatchSnapshot()
    })

    it("generate full Manifest file with fingerprint", () => {
        expect.assertions(2)

        const output = manifestGenerator(
            {
                manifest,
                fingerprints: true,
                icons: recommendedIcons,
            } as InternalOptions,
            (path) => relative(path, "/", true),
            NullLogger
        )

        const data = output[0]

        expect(data.name).toStrictEqual(`manifest.${fingerprint(data.contents)}.webmanifest`)
        expect(wrap(data.contents)).toMatchSnapshot()
    })

    it("generate full Manifest file with fingerprint and localize", () => {
        expect.assertions(4)

        const usManifest = {
            ...manifest,
            lang: "en-US",
        }

        const output = manifestGenerator(
            {
                manifest: {
                    ...manifest,
                    localize: [usManifest],
                },
                fingerprints: true,
                icons: recommendedIcons,
            } as InternalOptions,
            (path) => relative(path, "/", true),
            NullLogger
        )

        expect(output[0].name).toStrictEqual(`manifest.${fingerprint(output[0].contents)}.webmanifest`)
        expect(wrap(output[0].contents)).toMatchSnapshot()

        expect(output[1].name).toStrictEqual(`manifest_en-US.${fingerprint(output[1].contents)}.webmanifest`)
        expect(wrap(output[1].contents)).toMatchSnapshot()
    })
})
