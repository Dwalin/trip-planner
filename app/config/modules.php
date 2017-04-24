<?php
/**
 * Register application modules
 */
$application->registerModules(array(
                                  'api' => array(
                                      'className' => 'Module',
                                      'path'      => __DIR__ . '/../Module.php'
                                  )
                              ));