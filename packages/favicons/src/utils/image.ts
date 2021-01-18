import FastXmlParser from "fast-xml-parser"
import color from "tinycolor2"
import Jimp from "jimp"

export const parseColor = (hex: string): number => {
    const { r, g, b, a } = color(hex).toRgb()

    return Jimp.rgbaToInt(r, g, b, a * 255)
}

// sharp renders the SVG in its source width and height with 72 DPI which can
// cause a blurry result in case the source SVG is defined in lower size than
// the target size. To avoid this, resize the source SVG to the needed size
// before passing it to sharp by increasing its width and/or height
// attributes.
//
// Currently it seems this won't be fixed in sharp, so we need a workaround:
// https://github.com/lovell/sharp/issues/729#issuecomment-284708688
//
// They suggest setting the image density to a "resized" density based on the
// target render size but this does not seem to work with icons and may
// cause other errors with "unnecessarily high" image density values.
//
// For further information, see:
// https://github.com/itgalaxy/favicons/issues/264

export const ensureSize = (
    svgSource: { size: { width: number; height: number }; file: string },
    width: number,
    height: number
) => {
    let svgWidth = svgSource.size.width
    let svgHeight = svgSource.size.height

    if (svgWidth >= width && svgHeight >= height) {
        // If the base SVG is large enough, it does not need to be modified.
        return Promise.resolve(svgSource.file)
    } else if (width > height) {
        svgHeight = Math.round(svgHeight * (width / svgWidth))
        svgWidth = width
    } else {
        // width <= height
        svgWidth = Math.round(svgWidth * (height / svgHeight))
        svgHeight = height
    }

    // Modify the source SVG's width and height attributes for sharp to render
    // it correctly.
    // log("svgtool:ensureSize", `Resizing SVG to ${svgWidth}x${svgHeight}`)
    return resize(svgSource.file, svgWidth, svgHeight)
}

export const resize = (svgFile: string, width: number, height: number): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const jsonObject = FastXmlParser.parse(svgFile, {}, true)

            jsonObject.svg.$.width = width
            jsonObject.svg.$.height = height

            const j2xParser = FastXmlParser.j2xParser
            const modifiedSvg = new j2xParser({}).parse(jsonObject)

            resolve(Buffer.from(modifiedSvg))
        } catch (error) {
            return reject(error)
        }
    })
}
