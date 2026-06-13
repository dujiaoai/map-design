package com.yunyan.saasapi.test;

import com.yunyan.saasapi.security.InMemoryAccessTokenDenylist;
import org.springframework.core.Ordered;
import org.springframework.test.context.TestContext;
import org.springframework.test.context.support.AbstractTestExecutionListener;

/** Clears in-memory JWT denylist between tests so @Sql DB resets are not undermined. */
public class AccessTokenDenylistTestResetListener extends AbstractTestExecutionListener {

  @Override
  public int getOrder() {
    return Ordered.LOWEST_PRECEDENCE;
  }

  @Override
  public void beforeTestMethod(TestContext testContext) {
    var context = testContext.getApplicationContext();
    if (context == null) {
      return;
    }
    context
        .getBeansOfType(InMemoryAccessTokenDenylist.class)
        .values()
        .forEach(InMemoryAccessTokenDenylist::resetForTests);
  }
}
