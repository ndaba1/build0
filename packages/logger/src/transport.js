/**
 * @typedef {{
 * pretty: boolean,
 * }} S3TransportOptions
 */
import build from "pino-abstract-transport";

/**
 *
 * @param {S3TransportOptions} opts
 */
export default async function (opts) {
  return build(async function (source) {
    for await (let obj of source) {
      // const toDrain = !destination.write(obj.msg.toUpperCase() + '\n')
      // // This block will handle backpressure
      // if (toDrain) {
      //   await once(destination, 'drain')
      // }
    }
  })
}
