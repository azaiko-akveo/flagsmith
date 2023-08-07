import {
    addSegmentOverride,
    addSegmentOverrideConfig, assertTextContent, byId,
    click,
    createFeature,
    createRemoteConfig,
    createSegment, createTrait, deleteFeature, gotoFeature,
    gotoFeatures,
    gotoSegments, goToUser,
    log,
    login, saveFeatureSegments, setSegmentOverrideIndex, setText, viewFeature, waitAndRefresh, waitForElementVisible,
} from '../helpers.cafe';

const email = 'nightwatch@solidstategroup.com';
const password = 'str0ngp4ssw0rd!';
export default async function() {
    log('Login', 'Segment Test');
    await login(email, password);
    await click('#project-select-0');

    log('Create segments', 'Segment Test');
    await gotoSegments();
    await createSegment(0, 'segment_1', [
        {
            name: 'trait',
            operator: 'EQUAL',
            value: '1',
        },
    ]);
    await createSegment(1, 'segment_2', [
        {
            name: 'trait2',
            operator: 'EQUAL',
            value: '2',
        },
    ]);
    await createSegment(2, 'segment_3', [
        {
            name: 'trait3',
            operator: 'EQUAL',
            value: '3',
        },
    ]);

    log('Create Features', 'Segment Test');
    await gotoFeatures();
    await createFeature(0, 'flag');
    await createRemoteConfig(0, 'config', 0);

    log('Set segment overrides features', 'Segment Test');
    await viewFeature(0);
    await addSegmentOverrideConfig(0, 3, 2);
    await addSegmentOverrideConfig(1, 2, 1);
    await addSegmentOverrideConfig(2, 1, 0);
    await saveFeatureSegments();
    await viewFeature(1);
    await addSegmentOverride(0, true, 2);
    await addSegmentOverride(1, false, 1);
    await addSegmentOverride(2, true, 0);
    await saveFeatureSegments();

    log('Set user in segment_1', 'Segment Test');
    await goToUser(0);
    await createTrait(0, 'trait', 1);
    await createTrait(1, 'trait2', 2);
    await createTrait(2, 'trait3', 3);
    // await assertTextContent(byId('segment-0-name'), 'segment_1'); todo: view user segments disabled in edge
    await waitForElementVisible(byId('user-feature-switch-1-on'));
    await assertTextContent(byId('user-feature-value-0'), '1');

    log('Prioritise segment 2', 'Segment Test');
    await gotoFeatures();
    await gotoFeature(0);
    await setSegmentOverrideIndex(1, 0);
    await saveFeatureSegments();
    await gotoFeature(1);
    await setSegmentOverrideIndex(1, 0);
    await saveFeatureSegments();
    await goToUser(0);
    await waitForElementVisible(byId('user-feature-switch-1-off'));
    await assertTextContent(byId('user-feature-value-0'), '2');

    log('Prioritise segment 3', 'Segment Test');
    await gotoFeatures();
    await gotoFeature(0);
    await setSegmentOverrideIndex(2, 0);
    await saveFeatureSegments();
    await gotoFeature(1);
    await setSegmentOverrideIndex(2, 0);
    await saveFeatureSegments();
    await goToUser(0);
    await waitForElementVisible(byId('user-feature-switch-1-on'));
    await assertTextContent(byId('user-feature-value-0'), '3');

    log('Clear down features', 'Segment Test');
    await gotoFeatures();
    await deleteFeature(1, 'flag');
    await deleteFeature(0, 'config');

    log('Create features', 'Segment Test');
    await gotoFeatures();
    await createFeature(0, 'flag', true);
    await createRemoteConfig(0, 'config', 0, 'Description');

    log('Toggle flag for user', 'Segment Test');
    await goToUser(0);
    await click(byId('user-feature-switch-1-on'));
    await click('#confirm-toggle-feature-btn');
    await waitAndRefresh(); // wait and refresh to avoid issues with data sync from UK -> US in github workflows
    await waitForElementVisible(byId('user-feature-switch-1-off'));

    log('Edit flag for user', 'Segment Test');
    await click(byId('user-feature-0'));
    await setText(byId('featureValue'), 'small');
    await click('#update-feature-btn');
    await waitAndRefresh(); // wait and refresh to avoid issues with data sync from UK -> US in github workflows
    await assertTextContent(byId('user-feature-value-0'), '"small"');

    log('Toggle flag for user again', 'Segment Test');
    await click(byId('user-feature-switch-1-off'));
    await click('#confirm-toggle-feature-btn');
    await waitAndRefresh(); // wait and refresh to avoid issues with data sync from UK -> US in github workflows
    await waitForElementVisible(byId('user-feature-switch-1-on'));

}
