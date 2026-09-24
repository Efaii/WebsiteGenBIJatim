import assert from "node:assert/strict";
import { cmsPublicationStatus } from "../domain/cms-program-status";

assert.equal(cmsPublicationStatus("ARCHIVED"), "ARCHIVED");
assert.equal(cmsPublicationStatus("PUBLISHED"), "PUBLISHED");
assert.equal(cmsPublicationStatus("archived"), undefined);
assert.equal(cmsPublicationStatus("UNKNOWN"), undefined);
assert.equal(cmsPublicationStatus(undefined), undefined);
