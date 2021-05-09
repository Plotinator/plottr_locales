//
//  DocumentViewController.swift
//  plottr_mobile
//
//  Created by Cameron Sutter on 5/14/20.
//

import UIKit
//import React

@objc(DocumentViewController)
class DocumentViewController: UIViewController {
  
  @objc static func requiresMainQueueSetup() -> Bool {
      return true
  }

  var document: PlottrDocument?
  var vc: UIViewController?
  var events: DocEvents = DocEvents.sharedInstance
  static var _sharedInstance: DocumentViewController?

  static func setSharedInstance(instance: DocumentViewController?) {
    DocumentViewController._sharedInstance = instance
  }

  static func sharedInstance() -> DocumentViewController? {
    return _sharedInstance
  }
  
  func openDocument() -> Void {
//    vc = UIViewController()
    // Access the document
    document?.open(completionHandler: { (success) in
      if success {
        // Display the content of the document

        let initialData:NSDictionary = [
          "documentURL": (self.document?.fileURL)!.absoluteString,
          "data": self.document?.stringContents() ?? ""
        ]
        
//        self.events.openDocument(data: initialData)
        DocEvents.openDocument(data: initialData)

      } else {
        // Make sure to handle the failed import appropriately, e.g., by presenting an error message to the user.
        print("failed import")
      }
    })
  }

  // MARK: React Native methods

  // TODO: this isn't complete yet and doesn't work
  @objc func readDocument(_ fileURL: String) -> Void {
    print("readDocument \(fileURL)")
    let docURL = URL(fileURLWithPath: fileURL.replacingOccurrences(of: "file://", with: ""))
//    let doc = PlottrDocument(fileURL: docURL)

//    DocumentViewController._sharedInstance?.document = doc
//    print("after shared instance \(DocumentViewController._sharedInstance?.document?.fileURL)")
//    DocumentViewController._sharedInstance?.openDocument()
    var error: NSError? = nil
    NSFileCoordinator().coordinate(readingItemAt: docURL, error: &error) { (url) in

      print("in coordinator")

      guard url.startAccessingSecurityScopedResource() else {
        // Handle the failure here.
        Swift.debugPrint("*** Unable to access the contents of \(url.path) ***\n")
        print("*** Unable to access the contents of \(url.path) ***\n")
        return
      }

      // do stuff
      let doc = PlottrDocument(fileURL: url)
      doc.open(completionHandler: { (success) in
        if success {
          // Display the content of the document

          let initialData:NSDictionary = [
            "documentURL": doc.fileURL.absoluteString,
            "data": doc.stringContents()
          ]

          //        self.events.openDocument(data: initialData)
          DocEvents.openDocument(data: initialData)

        } else {
          print("state \(doc.documentState.contains(.editingDisabled)) \(doc.documentState.contains(.closed)) \(doc.documentState.contains(.inConflict)) \(doc.documentState.contains(.normal)) \(doc.documentState.contains(.progressAvailable)) \(doc.documentState.contains(.savingError))")
          // Make sure to handle the failed import appropriately, e.g., by presenting an error message to the user.
          print("failed import")
        }
      })

      url.stopAccessingSecurityScopedResource()
    }
  }

  @objc func updateDocument(_ fileURL: String, withData data: String) -> Void {
    let docViewController = DocumentViewController._sharedInstance
    var doc = docViewController?.document
    if (doc == nil || doc?.fileURL != URL(fileURLWithPath: fileURL)) {
      doc = PlottrDocument(fileURL: URL(fileURLWithPath: fileURL))
      DocumentViewController._sharedInstance?.document = doc
    }
    doc?.updateStringContents(data: data)
    doc?.updateChangeCount(.done)
    docViewController?.document?.save(to: (doc?.fileURL)!, for: .forOverwriting, completionHandler: { (saved) in
      print("SAVED doc")
    })
  }

  @objc func closeDocument() -> Void {
    guard let docViewController = DocumentViewController._sharedInstance else { return }
    docViewController.document?.close(completionHandler: { (success) in
      docViewController.document?.fileURL.stopAccessingSecurityScopedResource()
    })
  }
}

